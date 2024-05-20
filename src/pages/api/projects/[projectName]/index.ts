import {
  addCollaborator,
  createRepositoryFromTemplate,
  enablePages,
} from '@lib/GitHub/index.ts';
import type { APIRoute } from 'astro';
import type { apiProjectsProjectNamePost } from '@ty/api.ts';
import type { FullRepository, RepositoryInvitation } from '@ty/github.ts';
import { useGit } from '@lib/git/useGit.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { Projects, UserInfo } from '@ty/Types.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import type { Tags, MediaPlayer, ProviderUser } from '@ty/Types.ts';

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
      token?.value as string,
      projectName as string,
      body.description,
      body.visibility
    );

    if (resp.status > 201) {
      console.error('Failed to create project repo: ', resp.statusText);
      return new Response(null, { status: 500, statusText: resp.statusText });
    }

    const repo: FullRepository = await resp.json();

    // Enable pages
    const respPages: Response = await enablePages(
      projectName as string,
      token?.value as string
    );

    if (respPages.status > 204) {
      console.error('Status: ', respPages.status);
      console.error('Failed to enable GitHub pages: ', respPages.statusText);
      return new Response(null, {
        status: 500,
        statusText: respPages.statusText,
      });
    }

    console.info('GitHub Pages enabled!');

    // Add Collaborators
    const collabs: ProviderUser[] = [];
    for (let i = 0; i < body.additionalUsers.length; i++) {
      const respCollabs: Response = await addCollaborator(
        projectName as string,
        body.additionalUsers[i],
        token?.value as string
      );

      const data: RepositoryInvitation = await respCollabs.json();

      collabs.push({
        loginName: data.invitee!.login,
        avatarURL: data.invitee!.avatar_url,
        admin: data.permissions === 'admin',
      });
    }
    console.log('Collaborators created');
    // First update the admin data
    {
      // Create a filesystem
      const fs = initFs('avannotate');

      // Update the admin project.json file
      const { readFile, writeFile, commitAndPush } = await gitRepo({
        fs: fs,
        workingDir: '/',
        repositoryURL: import.meta.env.GIT_REPO_ADMIN_DATA,
        proxyUrl: import.meta.env.PROXY_URL,
        userInfo: info as UserInfo,
      });

      const projs = await readFile(fs, '/', './data/projects.json');
      const projects: Projects = JSON.parse(projs as string);

      projects.projects.push({
        title: body.title,
        description: body.description,
        language: body.language,
        slug: body.slug,
        authors: body.projectAuthors,
        mediaPlayer: body.mediaPlayer,
        autoPopulateHomePage: body.autoPopulateHomePage,
        additionalUsers: collabs,
        createdAt: new Date().toISOString(),
        updatedAt: '',
      });

      const success = await writeFile(
        fs,
        '/',
        './data/projects.json',
        JSON.stringify(projects)
      );

      if (!success) {
        console.error('Failed to write project data');
        return new Response(null, {
          status: 500,
          statusText: 'Failed to write project data',
        });
      }

      const successCommit = await commitAndPush(
        fs,
        '/',
        info as UserInfo,
        'main',
        `Updated projects file with ${body.title}`
      );

      if (successCommit.error) {
        console.error('Failed to write project data: ', successCommit.error);
        return new Response(null, {
          status: 500,
          statusText: 'Failed to write project data: ' + successCommit.error,
        });
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
