import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { apiPagePut } from '@ty/api.ts';
import type { APIRoute, AstroCookies } from 'astro';

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
};

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName, pageUuid } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const body: apiPagePut = await request.json();

  const { page } = body;

  if (!page.created_at) {
    page.created_at = new Date().toJSON();
  }

  if (!page.created_by) {
    page.created_by = info.profile.gitHubName as string;
  }

  page.updated_at = new Date().toJSON();
  page.updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const { writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  writeFile(`/data/pages/${pageUuid}.json`, JSON.stringify(page));

  const successCommit = await commitAndPush(`Updated page ${body.page.title}`);

  if (successCommit.error) {
    console.error('Failed to write page data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write page data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(page), { status: 200 });
};

export const DELETE: APIRoute = async ({ cookies, params, redirect }) => {
  const { pageUuid, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !pageUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const { commitAndPush, deleteFile } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  const filepath = `/data/pages/${pageUuid}.json`;

  await deleteFile(filepath);

  const successCommit = await commitAndPush(`Deleted page ${pageUuid}`);

  if (successCommit.error) {
    console.error('Failed to write page data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write page data: ' + successCommit.error,
    });
  }

  return new Response(null, { status: 200 });
};
