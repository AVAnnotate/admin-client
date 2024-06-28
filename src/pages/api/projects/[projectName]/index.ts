import {
  addCollaborator,
  createRepositoryFromTemplate,
  enablePages,
  replaceRepoTopics,
  getUser,
} from '@lib/GitHub/index.ts';
import type { APIRoute } from 'astro';
import type { apiProjectsProjectNamePost } from '@ty/api.ts';
import type { FullRepository, RepositoryInvitation } from '@ty/github.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { ProjectData, UserInfo } from '@ty/Types.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import type { Tags, MediaPlayer, ProviderUser } from '@ty/Types.ts';
import { delay } from '@lib/utility/index.ts';

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
    const body: apiProjectsProjectNamePost = await request.json();

    // Create the new repo from template
    console.log('Template repo: ', body.templateRepo);
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
    const collabs: ProviderUser[] = [];
    for (let i = 0; i < body.additionalUsers.length; i++) {
      const respCollabs: Response = await addCollaborator(
        projectName as string,
        body.gitHubOrg,
        body.additionalUsers[i],
        token?.value as string
      );

      if (!respCollabs.ok) {
        console.error(`Failed to add collaborator ${body.additionalUsers[i]}`);
        return new Response(null, {
          status: 500,
          statusText: respTopics.statusText,
        });
      }

      if (respCollabs.status == 204) {
        // Must be a team member
        const userResp = await getUser(
          token?.value as string,
          body.additionalUsers[i]
        );

        if (!userResp.ok) {
          console.error(
            `Failed to find collaborator ${body.additionalUsers[i]}`
          );
        } else {
          const data = await userResp.json();

          collabs.push({
            loginName: data.login,
            avatarURL: data.avatar_url,
            admin: false,
          });
        }
      } else {
        console.log('Reading Collabs resp', respCollabs);
        const data: RepositoryInvitation = await respCollabs.json();

        collabs.push({
          loginName: data.invitee!.login,
          avatarURL: data.invitee!.avatar_url,
          admin: data.permissions === 'admin',
        });
      }
    }
    console.log('Collaborators created');

    // Delay before continuing as generating a repo from a template is not instantaneous
    await delay(5000);

    // Update the project data
    const fs = initFs();

    console.log('Repo: ', repo.html_url);
    // Update the admin project.json file
    const { readFile, writeFile, commitAndPush } = await gitRepo({
      fs: fs,
      repositoryURL: repo.html_url,
      userInfo: info as UserInfo,
    });

    const projs = await readFile('/data/project.json');
    let project: ProjectData = JSON.parse(projs as string);

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
