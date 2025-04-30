import { gitRepo } from '@backend/gitRepo.ts';
import { getPageData, getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import {
  getNewOrder,
  updateProjectLastUpdated,
  ensureUniqueSlug,
  trimStringToMaxLength,
} from '@lib/pages/index.ts';
import type { apiPagePut } from '@ty/api.ts';
import type { Page } from '@ty/Types.ts';
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

  if (!token || !info || !projectName || !pageUuid) {
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

  const fs = initFs();

  const { readFile, readDir, writeFile, commitAndPush, context } =
    await gitRepo({
      fs,
      repositoryURL,
      branch: 'main',
      userInfo: info,
    });

  const oldPage = JSON.parse(
    readFile(`/data/pages/${pageUuid}.json`) as string
  ) as Page;

  if (oldPage.title !== page.title) {
    const pageSlug = ensureUniqueSlug(body.page?.title, context);

    page.slug = pageSlug;
  }

  writeFile(`/data/pages/${pageUuid}.json`, JSON.stringify(page, null, 2));

  const { pages } = getPageData(
    fs,
    readDir('/data/pages') as unknown as string[],
    'pages'
  );

  await updateProjectLastUpdated(context);

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

  const { commitAndPush, readFile, deleteFile, writeFile, context } =
    await gitRepo({
      fs: initFs(),
      repositoryURL,
      branch: 'main',
      userInfo: info,
    });

  const filepath = `/data/pages/${pageUuid}.json`;

  await deleteFile(filepath);

  const order: string[] = JSON.parse(
    readFile('/data/pages/order.json').toString()
  );

  const newOrder = order.filter((uuid) => uuid !== pageUuid);

  writeFile('/data/pages/order.json', JSON.stringify(newOrder));

  await updateProjectLastUpdated(context);

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
