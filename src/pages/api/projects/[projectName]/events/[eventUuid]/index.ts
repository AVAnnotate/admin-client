import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { setTemplate } from '@lib/annotations/index.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo } from '@ty/Types.ts';
import type { apiEventPut } from '@ty/api.ts';
import type { APIRoute, AstroCookies } from 'astro';
import { v4 as uuidv4 } from 'uuid';

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

  const { eventUuid, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid) {
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

  const { readFile, writeFile, commitAndPush } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    branch: 'main',
    userInfo: info as UserInfo,
  });

  const filepath = `/data/events/${eventUuid}.json`;

  const originalEvent = JSON.parse(readFile(filepath) as string);

  // if any new AV files were added, we need to create a default annotation set
  const newAvFiles = Object.keys(event.audiovisual_files).filter(
    (key) => !originalEvent.audiovisual_files[key]
  );

  newAvFiles.forEach((key) => {
    const defaultSetUuid = uuidv4();

    writeFile(
      `/data/annotations/${defaultSetUuid}.json`,
      JSON.stringify(
        {
          ...setTemplate,
          event_id: eventUuid,
          source_id: key,
        },
        null,
        2
      )
    );
  });

  // now update the event file
  writeFile(filepath, JSON.stringify(event, null, 2));

  const successCommit = await commitAndPush(`Updated event ${eventUuid}`);

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
  const { eventUuid, projectName } = params;

  const { token, info } = await setup(cookies);

  if (!token || !info || !projectName || !eventUuid) {
    return redirect('/', 307);
  }

  const repositoryURL = getRepositoryUrl(projectName);

  const { readDir, readFile, commitAndPush, deleteFile, writeFile } =
    await gitRepo({
      fs: initFs(),
      repositoryURL,
      branch: 'main',
      userInfo: info as UserInfo,
    });

  const filepath = `/data/events/${eventUuid}.json`;

  const annotationFiles = readDir('/data/annotations');

  // we need to delete corresponding annotation files too
  const matchingAnnoFiles = annotationFiles.filter((filepath) => {
    const contents = readFile(`/data/annotations/${filepath}`);
    let parsed;

    try {
      parsed = JSON.parse(contents as string);
    } catch (e) {
      console.log(
        `Error parsing annotation file ${filepath} as JSON. Skipping.${e}`
      );
    }

    if (parsed && parsed.event_id === eventUuid) {
      return true;
    }
  });

  matchingAnnoFiles.forEach(async (filepath) => {
    await deleteFile(`/data/annotations/${filepath}`);
  });

  // Delete any associated auto-generated event files
  const pageFiles = readDir('/data/pages', '.json');

  // Keep a list or deleted files to remove from order.json
  const deleteList: string[] = [];
  const matchingPageFiles = pageFiles.filter((filepath) => {
    const contents = readFile(`/data/pages/${filepath}`);
    const parsed = JSON.parse(contents as string);

    console.log(parsed);
    if (
      parsed &&
      parsed.autogenerate &&
      parsed.autogenerate.enabled &&
      parsed.autogenerate.type === 'event' &&
      parsed.autogenerate.type_id === eventUuid
    ) {
      deleteList.push((filepath as string).replace('.json', ''));
      return true;
    }
  });

  matchingPageFiles.forEach(async (filepath) => {
    await deleteFile(`/data/pages/${filepath}`);
  });

  if (deleteList.length > 0) {
    const orderFile = readFile('/data/pages/order.json');

    const order = JSON.parse(orderFile as string);

    console.log('Delete: ', deleteList);
    const newOrder: string[] = order.filter(
      (o: string) => !deleteList.includes(o)
    );

    await writeFile(
      '/data/pages/order.json',
      JSON.stringify(newOrder, null, 2)
    );
  }

  // Delete the event
  await deleteFile(filepath);

  const successCommit = await commitAndPush(`Deleted event ${eventUuid}`);

  if (successCommit.error) {
    console.error('Failed to delete event: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to delete event: ' + successCommit.error,
    });
  }

  return new Response(null, { status: 200 });
};
