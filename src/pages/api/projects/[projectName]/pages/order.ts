import { gitRepo } from '@backend/gitRepo.ts';
import { getPageData, getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';
import type { apiPageOrderPost } from '@ty/api.ts';
import type { APIRoute } from 'astro';

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const body: apiPageOrderPost = await request.json();

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { exists, readDir, writeFile, commitAndPush, context } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  writeFile('/data/pages/order.json', JSON.stringify(body.order));

  await updateProjectLastUpdated(context);

  const successCommit = await commitAndPush('Updated page order');

  if (successCommit.error) {
    console.error('Failed to write order data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write order data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(body), { status: 200 });
};

export const GET: APIRoute = async ({ cookies, params, request, redirect }) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { readFile } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  const order = readFile('/data/pages/order.json');

  return new Response(JSON.stringify(order), { status: 200 });
};
