import {
  createRepositoryFromTemplate,
  enablePages,
  replaceRepoTopics,
} from '@lib/GitHub/index.ts';
import type { APIRoute, AstroCookies } from 'astro';
import type { apiProjectPut, apiProjectsProjectNamePost } from '@ty/api.ts';
import type { FullRepository } from '@ty/github.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo, Project, ProjectFile } from '@ty/Types.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import { delay } from '@lib/utility/index.ts';
import {
  getRepositoryUrl,
  addCollaborators,
  parseSlug,
} from '@backend/projectHelpers.ts';

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
    const token = cookies.get('access-token')?.json();

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

    // Create the new repo from template
    const resp: Response = await createRepositoryFromTemplate(
      body.templateRepo,
      body.gitHubOrg,
      token?.value as string,
      projectName as string,
      body.description,
      body.visibility
    );

    if (!resp.ok) {
      console.error('Failed to create project repo: ', resp.statusText);
      console.error('Body: ', body);
      return new Response(null, { status: 500, statusText: resp.statusText });
    }

    const repo: FullRepository = await resp.json();

    // Enable pages
    const respPages: Response = await enablePages(
      body.gitHubOrg,
      projectName as string,
      token?.value as string
    );

    if (!respPages.ok) {
      console.error('Status: ', respPages.status);
      console.error('Failed to enable GitHub pages: ', respPages.statusText);
      return new Response(null, {
        status: 500,
        statusText: respPages.statusText,
      });
    }

    console.info('GitHub Pages enabled!');

    // Add avannotate-project topic
    const respTopics: Response = await replaceRepoTopics(
      body.gitHubOrg,
      projectName as string,
      ['avannotate-project'],
      token?.value as string
    );

    if (!respTopics.ok) {
      console.error('Status: ', respTopics.status);
      console.error('Failed to add topic: ', respTopics.statusText);
      return new Response(null, {
        status: 500,
        statusText: respTopics.statusText,
      });
    }

    // Add Collaborators
    let collabs;

    try {
      collabs = await addCollaborators(
        body.additionalUsers,
        projectName,
        body.gitHubOrg,
        token
      );
    } catch (e) {
      return new Response(null, {
        status: 500,
        statusText: e as string,
      });
    }

    // Delay before continuing as generating a repo from a template is not instantaneous
    await delay(5000);

    // Update the project data
    const fs = initFs();

    // Update the admin project.json file
    const { readFile, writeFile, commitAndPush } = await gitRepo({
      fs: fs,
      repositoryURL: repo.html_url,
      userInfo: info as UserInfo,
    });

    const projs = readFile('/data/project.json');
    let project: ProjectFile = JSON.parse(projs as string);

    project = {
      publish: {
        publish_pages_app: true,
        publish_sha: '',
        publish_iso_date: '',
      },
      users: collabs,
      project: {
        github_org: body.gitHubOrg,
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
      JSON.stringify(project)
    );

    if (!success) {
      console.error('Failed to write project data');
      return new Response(null, {
        status: 500,
        statusText: 'Failed to write project data',
      });
    }

    const successCommit = await commitAndPush(
      `Updated project file for ${body.title}`
    );

    if (successCommit.error) {
      console.error('Failed to write project data: ', successCommit.error);
      return new Response(null, {
        status: 500,
        statusText: 'Failed to write project data: ' + successCommit.error,
      });
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

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
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

  const { readFile, exists, writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    userInfo: info as UserInfo,
  });

  if (!exists('/data/project.json')) {
    return new Response('Missing project.json file in repository.', {
      status: 400,
    });
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

  const projectConfig = JSON.parse(readFile('/data/project.json').toString());

  // override existing properties with new ones from the request
  const newConfig: Project = {
    ...projectConfig,
    project: {
      ...projectConfig.project,
      ...body,
      additional_users: collabs,
    },
  };

  writeFile('/data/project.json', JSON.stringify(newConfig));

  const successCommit = await commitAndPush(
    `Updated project file for ${body.title}`
  );

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
