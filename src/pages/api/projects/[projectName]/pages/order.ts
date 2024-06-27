import { gitRepo } from '@backend/gitRepo.ts';
import { getPageData, getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
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

  const fs = initFs()

  const { exists, readDir, writeFile, commitAndPush } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  writeFile('/data/pages/order.json', JSON.stringify(body.order));

  const pageFiles = exists('/data/pages') ? readDir('/data/pages') : [];
  const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

  const { pages } = pageData;

  // iterate through the new order and update pages' parent
  // pages based on their location in the new array
  body.order.forEach((uuid, idx) => {
    if (pages[uuid].parent) {
      // match the page to the most recent non-child page above it
      const newParent = body.order
        .slice(0, idx + 1)
        .findLast(key => !pages[key].parent)

      if (newParent) {
        writeFile(`/data/pages/${uuid}.json`, JSON.stringify({ ...pages[uuid], parent: newParent }))
      } else {
        return new Response(null, {
          status: 400,
          statusText: "Can't have child page at top of list."
        })
      }
    }
  })

  const successCommit = await commitAndPush('Updated page order');

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(body), { status: 200 });
};
