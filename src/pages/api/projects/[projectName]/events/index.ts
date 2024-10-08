import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { setTemplate } from '@lib/annotations/index.ts';
import { initFs } from '@lib/memfs/index.ts';
import { autoGenerateEventPage } from '@lib/pages/autogenerate.ts';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';
import type { apiEventsPost } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';

// Create a new event
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

  const body: apiEventsPost = await request.json();

  if (!body.event && !body.events) {
    return new Response(null, {
      status: 400,
      statusText: 'Event body not found.',
    });
  }

  const created_at = new Date().toJSON();
  const created_by = info.profile.gitHubName as string;
  const updated_at = new Date().toJSON();
  const updated_by = info.profile.gitHubName as string;

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { exists, writeFile, commitAndPush, mkDir, context } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  const uuids: string[] = [];

  // Create the events folder if it doesn't exist
  if (!exists('/data/events')) {
    mkDir('/data/events');
  }

  // Support a single event or an array of events
  const list = body.events || [body.event];
  for (let i = 0; i < list.length; i++) {
    const ev = list[i];
    const uuid = uuidv4();

    const filepath = `/data/events/${uuid}.json`;

    const success = await writeFile(
      filepath,
      JSON.stringify(
        {
          ...ev,
          created_at,
          created_by,
          updated_at,
          updated_by,
        },
        null,
        2
      )
    );

    if (!success) {
      console.error('Failed to write event data');
      return new Response(null, {
        status: 500,
        statusText: 'Failed to write event data',
      });
    }

    // generate default annotation set for each AV file
    const keys = Object.keys(ev!.audiovisual_files);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      const defaultSetUuid = uuidv4();

      const successSet = await writeFile(
        `/data/annotations/${defaultSetUuid}.json`,
        JSON.stringify(
          {
            ...setTemplate,
            event_id: uuid,
            source_id: key,
          },
          null,
          2
        )
      );

      if (!successSet) {
        console.error('Failed to write default set');
        return new Response(null, {
          status: 500,
          statusText: 'Failed to write default set',
        });
      }
    }

    if (ev?.auto_generate_web_page) {
      await autoGenerateEventPage(context, info, ev, uuid);
    }

    uuids.push(uuid);
  }

  await updateProjectLastUpdated(context);

  // If autogenerate home page is on go ahead and create it

  const commitMessage = body.events
    ? `Added ${body.events.length} events`
    : `Added event ${uuids[0]}`;

  const successCommit = await commitAndPush(commitMessage);

  if (successCommit.error) {
    console.error('Failed to write event data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(body), { status: 200 });
};
