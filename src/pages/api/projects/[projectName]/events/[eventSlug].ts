import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl, parseSlug } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo } from '@ty/Types.ts';
import type { apiEventsPost } from '@ty/api.ts';
import type { APIRoute, AstroCookies } from 'astro';
import { v4 as uuid4 } from 'uuid';

const authenticate = async (cookies: AstroCookies, params: any) => {
  const { eventSlug } = params;

  // Allow /events/new to be used for creating a new event
  const uuid = eventSlug === 'new' ? uuid4() : eventSlug;

  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { uuid, token, info };
};

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

  const { uuid, token, info } = await authenticate(cookies, params);

  if (!token || !info || !projectName || !uuid) {
    return redirect('/', 307);
  }

  const body: apiEventsPost = await request.json();

  if (!body.created_at) {
    body.created_at = new Date().toJSON();
  }

  if (!body.created_by) {
    body.created_by = info.profile.gitHubName as string;
  }

  body.updated_at = new Date().toJSON();
  body.updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const { writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const filepath = `/data/events/${uuid}.json`;

  writeFile(filepath, JSON.stringify(body));

  const successCommit = await commitAndPush(`Updated event ${uuid}`);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(body), { status: 200 });
};

export const DELETE: APIRoute = async ({ cookies, params, redirect }) => {
  const { projectName } = params;

  const { uuid, token, info } = await authenticate(cookies, params);

  if (!token || !info || !projectName || !uuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const { commitAndPush, deleteFile } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const filepath = `/data/events/${uuid}.json`;

  deleteFile(filepath);

  const successCommit = await commitAndPush(`Deleted event ${uuid}`);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(null, { status: 200 });
};
