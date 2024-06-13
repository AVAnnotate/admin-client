import { gitRepo } from '@backend/gitRepo.ts';
import { parseSlug } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo } from '@ty/Types.ts';
import type { apiEventsPost } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { v4 as uuid4 } from 'uuid';

export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName, eventUuid } = params;

  // Allow /events/new to be used for creating a new event
  const uuid = eventUuid === 'new' ? uuid4() : eventUuid;

  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info || !projectName || !uuid) {
    return redirect('/', 307);
  }

  const body: apiEventsPost = await request.json();

  const fs = initFs();
  const { org, repo } = parseSlug(projectName);
  const repositoryURL = `https://github.com/${org}/${repo}`;

  const { writeFile, commitAndPush } = await gitRepo({
    fs,
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

  return new Response(null, { status: 200 });
};
