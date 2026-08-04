import {
  addRepositoryHomepage,
  createRepositoryFromTemplate,
  enablePages,
  replaceRepoTopics,
  getRepo,
  changeRepoVisibility,
  disablePages,
  removeRepositoryHomepage,
  isEnterpriseGitHubOrg,
  shouldIncludeSlugInBase,
} from '@lib/GitHub/index.ts';
import type { RepoVisibility } from '@lib/GitHub/index.ts';
import type { APIRoute } from 'astro';
import type { apiProjectPut, apiProjectsProjectNamePost } from '@ty/api.ts';
import type { FullRepository } from '@ty/github.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo, Page, ProjectData } from '@ty/Types.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import { delay } from '@lib/utility/index.ts';
import {
  getRepositoryUrl,
  addCollaborators,
  parseSlug,
} from '@backend/projectHelpers.ts';
import { v4 as uuidv4 } from 'uuid';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';

const logGitHubFailure = async (stage: string, response: Response) => {
  const requestId = response.headers.get('x-github-request-id');
  const responseBody = await response.clone().text();

  console.error(`GitHub ${stage} failed`, {
    status: response.status,
    statusText: response.statusText,
    requestId,
    responseBody,
  });
};

const logGitHubErrorResponse = async (
  stage: string,
  response: Response,
  context?: Record<string, unknown>
) => {
  const requestId =
    response.headers.get('x-github-request-id') ||
    response.headers.get('x-request-id') ||
    'unknown';
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  const scope = response.headers.get('x-oauth-scopes');
  const acceptedScope = response.headers.get('x-accepted-oauth-scopes');

  let responseBody: unknown = null;
  const rawBody = await response.text();
  if (rawBody) {
    try {
      responseBody = JSON.parse(rawBody);
    } catch {
      responseBody = rawBody;
    }
  }

  console.error(`[GitHub ${stage}] request failed`, {
    status: response.status,
    statusText: response.statusText,
    requestId,
    rateLimitRemaining,
    scope,
    acceptedScope,
    responseBody,
    ...context,
  });
};

// Note: this POST route is the only /api/projects route that expects the
// `projectName` param to be the bare name instead of the slug version that
// combines org and name. All other /api/projects API routes expect the full slug.
export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const token = cookies.get('access-token');

    // Get the user info
    const info = await userInfo(cookies);

    if (!token || !info) {
      redirect('/', 307);
    }

    const { projectName } = params;

    if (!projectName) {
      return new Response(null, { status: 400 });
    }

    const body: apiProjectsProjectNamePost = await request.json();

    const isUtexasSession = cookies.get('auth-provider')?.value === 'utexas';

    const repoVisibility = body.is_private
      ? 'private'
      : isEnterpriseGitHubOrg(body.gitHubOrg) || isUtexasSession
        ? 'internal'
        : 'public';

    // First see if we can create this repo
    const check: Response = await getRepo(
      token?.value as string,
      body.gitHubOrg,
      projectName as string
    );

    if (check.ok) {
      // If we got a repo, then one already exists. Fail.
      console.error('Repo already exists!');
      return new Response(
        JSON.stringify({
          avaError: '_repo_exists_',
        }),
        {
          status: 400,
        }
      );
    }
    // For UTexas EMU users the standard AVAnnotate template is outside their
    // enterprise and cannot be accessed with their token.  If a UTexas-specific
    // template org is configured and this session was started via the EMU login
    // path, use that org's copy of the template instead.
    const utexasTemplateOrg = import.meta.env.UTEXAS_GIT_REPO_ORG;
    const utexasTemplateRepo =
      import.meta.env.UTEXAS_GIT_REPO_PROJECT_TEMPLATE || body.templateRepo;

    const templateOwner =
      isUtexasSession && utexasTemplateOrg ? utexasTemplateOrg : undefined;
    const templateRepo =
      isUtexasSession && utexasTemplateOrg ? utexasTemplateRepo : body.templateRepo;

    // Create the new repo from template
    const resp: Response = await createRepositoryFromTemplate(
      templateRepo,
      body.gitHubOrg,
      token?.value as string,
      projectName as string,
      body.title,
      repoVisibility,
      templateOwner
    );

    if (!resp.ok) {
      await logGitHubErrorResponse('repo-create-from-template', resp, {
        gitHubOrg: body.gitHubOrg,
        templateRepo: body.templateRepo,
        projectName,
        visibility: repoVisibility,
      });
      return new Response(
        JSON.stringify({
          avaError: '_repo_create_failed_',
        }),
        { status: resp.status || 500, statusText: resp.statusText }
      );
    }

    const repo: FullRepository = await resp.json();

    // Two-step visibility change for GitHub EMU organizations: the template
    // generation API does not support `visibility: 'internal'`, so the repo
    // is first created as private (above) and then patched to internal here.
    // A short delay is required because GitHub initializes the repository
    // asynchronously after returning 201, and the PATCH can fail if issued
    // immediately.
    if (repoVisibility === 'internal') {
      await delay(2000);
      let visibilityResp = await changeRepoVisibility(
        token?.value as string,
        body.gitHubOrg,
        projectName as string,
        'internal'
      );

      if (!visibilityResp.ok) {
        // One retry after an additional short delay to handle transient failures.
        await logGitHubFailure('repo-visibility-internal-attempt-1', visibilityResp);
        await delay(3000);
        visibilityResp = await changeRepoVisibility(
          token?.value as string,
          body.gitHubOrg,
          projectName as string,
          'internal'
        );
      }

      if (!visibilityResp.ok) {
        await logGitHubFailure('repo-visibility-internal-attempt-2', visibilityResp);
        return new Response(
          JSON.stringify({
            avaError: '_repo_visibility_change_failed_',
          }),
          {
            status: 500,
            statusText: visibilityResp.statusText,
          }
        );
      }
    }

    if (isUtexasSession || body.generate_pages_site) {
      // Enable pages; for EMU (UTexas) sessions this is always required.
      const respPages: Response = await enablePages(
        body.gitHubOrg,
        projectName as string,
        token?.value as string
      );

      if (!respPages.ok) {
        await logGitHubErrorResponse('pages-enable', respPages, {
          gitHubOrg: body.gitHubOrg,
          projectName,
        });
        return new Response(
          JSON.stringify({
            avaError: '_failed_pages_enable_',
          }),
          {
            status: respPages.status || 500,
            statusText: respPages.statusText,
          }
        );
      }

      console.info('GitHub Pages enabled!');
    }

    // Add avannotate-project topic
    const respTopics: Response = await replaceRepoTopics(
      body.gitHubOrg,
      projectName as string,
      ['avannotate-project'],
      token?.value as string
    );

    if (!respTopics.ok) {
      await logGitHubErrorResponse('topics-replace', respTopics, {
        gitHubOrg: body.gitHubOrg,
        projectName,
      });
      return new Response(
        JSON.stringify({
          avaError: '_failed_adding_topic_',
        }),
        {
          status: respTopics.status || 500,
          statusText: respTopics.statusText,
        }
      );
    }

    // Add Collaborators
    let collabs;

    try {
      collabs = await addCollaborators(
        body.additionalUsers,
        projectName,
        body.gitHubOrg,
        token?.value as string
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          avaError: '_failed_adding_collaborators_',
        }),
        {
          status: 500,
          statusText: e as string,
        }
      );
    }

    // Delay before continuing as generating a repo from a template is not instantaneous
    await delay(5000);

    // Update the project data
    const fs = initFs();

    // Update the admin project.json file
    const { writeFile, commitAndPush } = await gitRepo({
      fs: fs,
      repositoryURL: repo.html_url,
      userInfo: info as UserInfo,
    });

    // const projs = readFile('/data/project.json');
    // let project: ProjectFile = JSON.parse(projs as string);

    const project = {
      publish: {
        publish_pages_app: body.generate_pages_site,
        publish_static_site: false,
        publish_sha: '',
        publish_iso_date: '',
        include_slug_in_base: shouldIncludeSlugInBase(
          body.gitHubOrg,
          cookies.get('auth-provider')?.value
        ),
      },
      users: collabs,
      project: {
        github_org: body.gitHubOrg,
        // Internal GitHub repos are represented as non-private in project metadata.
        is_private: body.is_private,
        title: body.title,
        description: body.description,
        language: body.language,
        slug: body.slug,
        creator: info!.profile.gitHubName as string,
        authors: body.projectAuthors,
        media_player: body.mediaPlayer,
        auto_populate_home_page: body.autoPopulateHomePage,
        additional_users: collabs,
        tags: body.tags || { tagGroups: [], tags: [] },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const success = await writeFile(
      '/data/project.json',
      JSON.stringify(project, null, 2)
    );

    if (!success) {
      console.error('Failed to write project data');
      return new Response(
        JSON.stringify({
          avaError: '_failed_file_write_',
        }),
        {
          status: 500,
          statusText: 'Failed to write project data',
        }
      );
    }

    // If autogenerate home page is on go ahead and create it
    const homePage: Page = {
      content: [],
      created_at: new Date().toISOString(),
      created_by: info!.profile.gitHubName || '',
      title: body.title,
      updated_at: new Date().toISOString(),
      updated_by: info!.profile.gitHubName || '',
      autogenerate: {
        enabled: body.autoPopulateHomePage,
        type: 'home',
      },
    };

    const pageId = uuidv4();
    const successPage = await writeFile(
      `/data/pages/${pageId}.json`,
      JSON.stringify(homePage, null, 2)
    );

    if (!successPage) {
      console.error('Failed to write project home page');
      return new Response(
        JSON.stringify({
          avaError: '_failed_file_write_',
        }),
        {
          status: 500,
          statusText: 'Failed to write project home page',
        }
      );
    }

    const pageOrder = [pageId];
    const successOrder = await writeFile(
      '/data/pages/order.json',
      JSON.stringify(pageOrder, null, 2)
    );

    if (!successOrder) {
      console.error('Failed to write project page order');
      return new Response(
        JSON.stringify({
          avaError: '_failed_file_write_',
        }),
        {
          status: 500,
          statusText: 'Failed to write project page order',
        }
      );
    }

    const successCommit = await commitAndPush(
      `Updated project file for ${body.title}`
    );

    if (successCommit.error) {
      console.error('Failed to write project data: ', successCommit.error);
      return new Response(
        JSON.stringify({
          avaError: '_failed_to_commit_',
        }),
        {
          status: 500,
          statusText: 'Failed to write project data: ' + successCommit.error,
        }
      );
    }

    // Finally create the homepage link if publishing
    if (body.generate_pages_site) {
      const respHomepage = await addRepositoryHomepage(
        body.gitHubOrg,
        projectName,
        info?.token as string,
        `https://${body.gitHubOrg}.github.io/${projectName}`
      );

      if (!respHomepage.ok) {
        // Don't fail for this
        console.log('Failed to create homepage link');
      }
    }

    return new Response(
      JSON.stringify({
        repoName: projectName,
        url: resp.body,
      })
    );
  } else {
    return new Response(null, { status: 400 });
  }
};

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  const { projectName } = params;

  if (!projectName) {
    return new Response(null, { status: 400 });
  }

  const body: apiProjectPut = await request.json();

  const slugContents = parseSlug(projectName);
  const repositoryURL = getRepositoryUrl(projectName);

  const { readFile, exists, writeFile, commitAndPush, context } = await gitRepo(
    {
      fs: initFs(),
      repositoryURL,
      userInfo: info as UserInfo,
    }
  );

  if (!exists('/data/project.json')) {
    return new Response('Missing project.json file in repository.', {
      status: 400,
    });
  }

  const projectConfig: ProjectData = JSON.parse(
    readFile('/data/project.json').toString()
  );

  // Has repo visibility changed?
  if (projectConfig.project.is_private !== body.is_private) {
    // For GitHub EMU organizations, repos can only be private or internal (not
    // public).  Sending `private: false` to the API would attempt a public
    // visibility change which would fail for EMU orgs.  Use explicit
    // visibility strings so the PATCH sets visibility correctly for all
    // transitions (including internal → private).
    const isEnterprise =
      isEnterpriseGitHubOrg(slugContents.org) ||
      cookies.get('auth-provider')?.value === 'utexas';
    const targetVisibility: boolean | RepoVisibility = isEnterprise
      ? body.is_private
        ? 'private'
        : 'internal'
      : body.is_private;

    const visResponse = await changeRepoVisibility(
      info?.token as string,
      slugContents.org,
      slugContents.repo,
      targetVisibility
    );

    if (!visResponse.ok) {
      return new Response(null, {
        status: 500,
        statusText: 'Failed update repo visibility: ' + visResponse.statusText,
      });
    }

    projectConfig.project.is_private = body.is_private;
  }

  // Sync pages site creation

  // Older projects may not have this value
  if (projectConfig.project.generate_pages_site === undefined) {
    projectConfig.project.generate_pages_site =
      projectConfig.publish.publish_pages_app;
  }
  if (projectConfig.project.generate_pages_site !== body.generate_pages_site) {
    if (
      projectConfig.project.generate_pages_site &&
      !body.generate_pages_site
    ) {
      console.log('Deleting Pages site.');
      const respDisable: Response = await disablePages(
        slugContents.org,
        slugContents.repo as string,
        info?.token as string
      );

      if (!respDisable.ok) {
        console.error('Status: ', respDisable.status);
        console.error(
          'Failed to delete GitHub pages: ',
          respDisable.statusText
        );
        return new Response(
          JSON.stringify({
            avaError: '_failed_pages_delete_',
          }),
          {
            status: 500,
            statusText: respDisable.statusText,
          }
        );
      }

      const homepageResp = await removeRepositoryHomepage(
        slugContents.org,
        slugContents.repo as string,
        info?.token as string
      );

      if (!homepageResp.ok) {
        // Log error but do not fail
        console.error('Status: ', homepageResp.status);
        console.error('Failed to delete Home page: ', homepageResp.statusText);
      }
    }
    if (body.generate_pages_site) {
      // Enable pages
      const respPages: Response = await enablePages(
        slugContents.org,
        slugContents.repo as string,
        info?.token as string
      );

      if (!respPages.ok) {
        await logGitHubFailure('pages-enable', respPages);
        console.error('Status: ', respPages.status);
        console.error('Failed to enable GitHub pages: ', respPages.statusText);
        return new Response(
          JSON.stringify({
            avaError: '_failed_pages_enable_',
          }),
          {
            status: 500,
            statusText: respPages.statusText,
          }
        );
      }

      console.info('GitHub Pages enabled!');

      const respHomepage = await addRepositoryHomepage(
        slugContents.org,
        slugContents.repo,
        info?.token as string,
        `https://${slugContents.org}.github.io/${slugContents.repo}`
      );

      if (!respHomepage.ok) {
        // Don't fail for this
        console.log('Failed to create homepage link');
      }
    }

    projectConfig.publish.publish_pages_app = !!body.generate_pages_site;
    projectConfig.project.generate_pages_site = !!body.generate_pages_site;
  }

  // Add Collaborators
  let collabs;

  try {
    collabs = await addCollaborators(
      body.additional_users.map((u) => u.login_name),
      slugContents.repo,
      slugContents.org,
      info?.token
    );
  } catch (e) {
    return new Response(null, {
      status: 500,
      statusText: e as string,
    });
  }

  // override existing properties with new ones from the request
  const newConfig: ProjectData = {
    ...projectConfig,
    publish: {
      ...projectConfig.publish,
    },
    project: {
      ...projectConfig.project,
      ...body,
      additional_users: collabs,
    },
  };

  await writeFile('/data/project.json', JSON.stringify(newConfig, null, 2));

  await updateProjectLastUpdated(context);

  const successCommit = await commitAndPush(
    `Updated project file for ${body.title}`
  );

  // Delay hack
  await delay(3000);

  if (successCommit.error) {
    console.error('Failed to write project data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write project data: ' + successCommit.error,
    });
  }

  return new Response(
    JSON.stringify({
      repoName: slugContents.repo,
      url: repositoryURL,
    })
  );
};
