import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { AnnotationPage } from '@ty/Types.ts';
import type { APIRoute, AstroCookies } from 'astro';

const setup = async (cookies: AstroCookies) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  return { token, info };
};

export const DELETE: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  const { projectName, eventUuid, annotationFileUuid, annotationUuid } = params;

  const { token, info } = await setup(cookies);

  if (
    !token ||
    !info ||
    !projectName ||
    !eventUuid ||
    !annotationFileUuid ||
    !annotationUuid
  ) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { commitAndPush, exists, deleteFile, readFile, writeFile } =
    await gitRepo({
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

  const annos: AnnotationPage = JSON.parse(readFile(filePath));

  if (annos.event_id !== eventUuid) {
    return new Response(null, {
      status: 400,
      statusText: 'Annotation file is not part of this project.',
    });
  }

  const deleteIdx = annos.annotations.findIndex(
    (anno) => anno.uuid === annotationUuid
  );

  if (deleteIdx === -1) {
    return new Response(null, {
      status: 400,
      statusText: 'Annotation not found.',
    });
  }

  annos.annotations.splice(deleteIdx, 1);

  // Delete the file if there are no annotations left.
  if (annos.annotations.length === 0) {
    deleteFile(filePath);
  } else {
    writeFile(filePath, JSON.stringify(annos, null, '  '));
  }

  const commitMessage = `Deleted annotation ${annotationUuid}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(annos), { status: 200 });
};
