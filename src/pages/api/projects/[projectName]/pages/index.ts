import { gitRepo } from '@backend/gitRepo.ts';
import { getPageData, getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import {
  ensureUniqueSlug,
  getNewOrder,
  trimStringToMaxLength,
  updateProjectLastUpdated,
} from '@lib/pages/index.ts';
import type { apiPagePost } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';

export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const body: apiPagePost = await request.json();

  const { page } = body;

  if (!page) {
    return new Response('Missing page data', { status: 400 });
  }

  const created_at = new Date().toJSON();
  const created_by = info.profile.gitHubName as string;
  const updated_at = new Date().toJSON();
  const updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const {
    readDir,
    readFile,
    writeFile,
    commitAndPush,
    exists,
    mkDir,
    context,
  } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  // Create the events folder if it doesn't exist
  if (!exists('/data/events')) {
    mkDir('/data/events');
  }

  const uuid = uuidv4();

  const maxTitle = trimStringToMaxLength(body.page?.title as string, 20);
  const pageSlug = ensureUniqueSlug(maxTitle, context);

  const newPage = {
    ...page,
    slug: pageSlug,
    created_at,
    created_by,
    updated_at,
    updated_by,
  };
  writeFile(`/data/pages/${uuid}.json`, JSON.stringify(newPage, null, 2));

  const { pages } = getPageData(
    fs,
    readDir('/data/pages', '.json') as unknown as string[],
    'pages'
  );

  const orderFile = readFile('/data/pages/order.json');

  const newOrder = getNewOrder(pages, uuid, JSON.parse(orderFile.toString()));

  writeFile('/data/pages/order.json', JSON.stringify(newOrder));

  await updateProjectLastUpdated(context);

  const successCommit = await commitAndPush(`Added page "${page.title}"`);

  if (successCommit.error) {
    console.error('Failed to write page data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write page data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify({ page: newPage }), { status: 200 });
};
