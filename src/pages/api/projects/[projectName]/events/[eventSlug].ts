import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo } from '@ty/Types.ts';
import type { apiEventPut } from '@ty/api.ts';
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

  const { eventSlug, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventSlug) {
    return redirect('/', 307);
  }

  const body: apiEventPut = await request.json();

  const { event } = body;

  if (!event.created_at) {
    event.created_at = new Date().toJSON();
  }

  if (!event.created_by) {
    event.created_by = info.profile.gitHubName as string;
  }

  event.updated_at = new Date().toJSON();
  event.updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const { writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const filepath = `/data/events/${eventSlug}.json`;

  writeFile(filepath, JSON.stringify(event));

  const successCommit = await commitAndPush(`Updated event ${eventSlug}`);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(event), { status: 200 });
};

export const DELETE: APIRoute = async ({ cookies, params, redirect }) => {
  const { eventSlug, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventSlug) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const { commitAndPush, deleteFile } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const filepath = `/data/events/${eventSlug}.json`;

  await deleteFile(filepath);

  const successCommit = await commitAndPush(`Deleted event ${eventSlug}`);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(null, { status: 200 });
};
