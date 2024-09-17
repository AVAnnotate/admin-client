import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';
import type { AnnotationPage, UserInfo } from '@ty/Types.ts';
import type { apiAnnotationSetPost } from '@ty/api.ts';
import type { APIRoute, AstroCookies } from 'astro';
import { v4 as uuid4 } from 'uuid';

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
};

// create an annotation set
export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { eventUuid, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid) {
    return redirect('/', 307);
  }

  const body: apiAnnotationSetPost = await request.json();

  if (!body.set || !body.event_id || !body.source_id) {
    return new Response(null, {
      status: 400,
      statusText: 'Missing required field in request body.',
    });
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const { writeFile, commitAndPush, context } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const uuid = uuid4();
  const newSet: AnnotationPage = {
    annotations: [],
    event_id: body.event_id,
    set: body.set,
    source_id: body.source_id,
  };

  const filepath = `/data/annotations/${uuid}.json`;

  writeFile(filepath, JSON.stringify(newSet, null, 2));

  await updateProjectLastUpdated(context);

  const successCommit = await commitAndPush(
    `Added new annotation set: ${newSet.set}`
  );

  if (successCommit.error) {
    console.error('Failed to write set data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write set data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(newSet), { status: 200 });
};
