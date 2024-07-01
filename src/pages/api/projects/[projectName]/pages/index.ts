import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
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

  const created_at = new Date().toJSON();
  const created_by = info.profile.gitHubName as string;
  const updated_at = new Date().toJSON();
  const updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const { writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  let titles: string[] = [];

  (body.pages || [body.page]).forEach((page) => {
    const uuid = uuidv4();

    const filepath = `/data/pages/${uuid}.json`;

    writeFile(
      filepath,
      JSON.stringify({
        ...page,
        created_at,
        created_by,
        updated_at,
        updated_by,
      })
    );

    titles.push(page!.title);
  });

  const commitMessage = body.pages
    ? `Added ${body.pages.length} pages`
    : `Added page "${titles[0]}"`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(event), { status: 200 });
};
