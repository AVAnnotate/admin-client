import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { apiAnnotationPost } from '@ty/api.ts';
import type { AnnotationPage } from '@ty/Types.ts';
import type { APIRoute, AstroCookies } from 'astro';
import { v4 as uuidv4 } from 'uuid';

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
};

export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  const { projectName, eventUuid, annotationFileUuid } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid || !annotationFileUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const body: apiAnnotationPost = await request.json();

  const fs = initFs();

  const { commitAndPush, exists, readFile, writeFile } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  const filePath = `/data/annotations/${annotationFileUuid}.json`;

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

  const newAnno = {
    ...body,
    uuid: uuidv4(),
  };

  annos.annotations.push(newAnno);

  writeFile(filePath, JSON.stringify(annos, null, '  '));

  const commitMessage = `Added annotation ${newAnno.uuid} to annotation file ${annotationFileUuid} in event ${eventUuid}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(newAnno), { status: 200 });
};
