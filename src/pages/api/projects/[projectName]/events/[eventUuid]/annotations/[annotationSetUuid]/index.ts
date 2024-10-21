import { checkVTTDelete, checkVTTUpdate } from '@backend/captionHelper.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';
import type { Annotation, AnnotationEntry, AnnotationPage } from '@ty/Types.ts';
import type { apiAnnotationPost, apiAnnotationSetPut } from '@ty/api.ts';
import type { APIRoute, AstroCookies } from 'astro';
import { v4 as uuidv4 } from 'uuid';

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
};

export const DELETE: APIRoute = async ({ cookies, params, redirect }) => {
  const { projectName, eventUuid, annotationSetUuid } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid || !annotationSetUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { commitAndPush, exists, deleteFile, readFile, context } =
    await gitRepo({
      fs,
      repositoryURL,
      branch: 'main',
      userInfo: info,
    });

  const filePath = `/data/annotations/${annotationSetUuid}.json`;

  if (!exists(filePath)) {
    return new Response(null, {
      status: 400,
      statusText: "Annotation file doesn't exist.",
    });
  }

  const annos: Annotation = JSON.parse(readFile(filePath) as string);

  deleteFile(filePath);

  await updateProjectLastUpdated(context);

  await checkVTTDelete(eventUuid, annos.source_id, annotationSetUuid, context);

  const commitMessage = `Deleted annotation set ${annotationSetUuid}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to delete set: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to delete set: ' + successCommit.error,
    });
  }

  return new Response('ok', { status: 200 });
};

export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  const { projectName, eventUuid, annotationSetUuid } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid || !annotationSetUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const body: apiAnnotationPost = await request.json();

  const fs = initFs();

  const { commitAndPush, exists, readFile, writeFile, context } = await gitRepo(
    {
      fs,
      repositoryURL,
      branch: 'main',
      userInfo: info,
    }
  );

  const filePath = `/data/annotations/${annotationSetUuid}.json`;

  if (!exists(filePath)) {
    return new Response(null, {
      status: 400,
      statusText: "Annotation file doesn't exist.",
    });
  }

  const annos: AnnotationPage = JSON.parse(readFile(filePath) as string);

  if (annos.event_id !== eventUuid) {
    return new Response(null, {
      status: 400,
      statusText: 'Annotation file is not part of this project.',
    });
  }

  let count = 0;
  const newAnnos: AnnotationEntry[] = [];

  // this endpoint excepts either a single annotation object,
  // or an array of annotation objects (used by the import feature)
  if (Array.isArray(body)) {
    body.forEach((anno) => {
      const newAnno = {
        ...anno,
        uuid: uuidv4(),
      };

      newAnnos.push(newAnno);
      count += 1;
    });
  } else {
    newAnnos.push({
      ...body,
      uuid: uuidv4(),
    });
    count = 1;
  }

  annos.annotations = annos.annotations.concat(newAnnos);

  writeFile(filePath, JSON.stringify(annos, null, 2));

  await updateProjectLastUpdated(context);

  await checkVTTUpdate(annos, annotationSetUuid, context);

  const commitMessage = `Added ${count || '1'} annotation${
    count === 1 ? '' : 's'
  } to set ${annotationSetUuid} in event ${eventUuid}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(newAnnos), { status: 200 });
};

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  const { projectName, eventUuid, annotationSetUuid } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid || !annotationSetUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const body: apiAnnotationSetPut = await request.json();

  const fs = initFs();

  const { commitAndPush, exists, readFile, writeFile, context } = await gitRepo(
    {
      fs,
      repositoryURL,
      branch: 'main',
      userInfo: info,
    }
  );

  const filePath = `/data/annotations/${annotationSetUuid}.json`;

  if (!exists(filePath)) {
    return new Response(null, {
      status: 400,
      statusText: "Annotation file doesn't exist.",
    });
  }

  const annos: AnnotationPage = JSON.parse(readFile(filePath) as string);

  if (annos.event_id !== eventUuid) {
    return new Response(null, {
      status: 400,
      statusText: 'Annotation file is not part of this project.',
    });
  }

  annos.set = body.set;

  writeFile(filePath, JSON.stringify(annos, null, 2));

  await updateProjectLastUpdated(context);

  await checkVTTUpdate(annos, annotationSetUuid, context);

  const commitMessage = `Updated name of annotation set ${annotationSetUuid} to ${body.set}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write set data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write set data: ' + successCommit.error,
    });
  }

  return new Response('ok', { status: 200 });
};
