import { gitRepo } from '@backend/gitRepo.ts';
import {
  getEventData,
  getPageData,
  getRepositoryUrl,
} from '@backend/projectHelpers.ts';
import { userInfo } from '@backend/userInfo.ts';
import { initFs } from '@lib/memfs/index.ts';
import { updateProjectLastUpdated } from '@lib/pages/index.ts';
import type { apiPageAutoGen } from '@ty/api.ts';
import type { Page, ProjectFile } from '@ty/Types.ts';
import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';
import {
  autoGenerateEventPage,
  autoGenerateHomePage,
  removeAutoGenerateEventPage,
  removeAutoGenerateHomePage,
} from '@lib/pages/autogenerate.ts';

const removeOrderEntry = (order: string[], uuid: string) => {
  let res = [...order];

  const idx = res.findIndex((o) => o === uuid);
  if (idx > -1) {
    res.splice(idx, 1);
  }

  return res;
};

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const body: apiPageAutoGen = await request.json();

  const repositoryURL = getRepositoryUrl(projectName);

  const fs = initFs();

  const { exists, readDir, readFile, commitAndPush, context } = await gitRepo({
    fs,
    repositoryURL,
    branch: 'main',
    userInfo: info,
  });

  const projectData = readFile('/data/project.json');
  if (!projectData) {
    console.error('Failed to read project data');
    return new Response(null, {
      status: 500,
      statusText: 'Failed to read project data',
    });
  }
  const project: ProjectFile = JSON.parse(projectData as string);

  const eventFiles = exists('/data/events') ? readDir('/data/events') : [];
  const eventData = getEventData(
    context,
    eventFiles as unknown as string[],
    'events'
  );

  const { events } = eventData;

  const pageFiles = exists('/data/pages') ? readDir('/data/pages') : [];
  const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

  const { pages } = pageData;

  // iterate through options and update/delete/create pages
  for (let i = 0; i < body.options.length; i++) {
    const option = body.options[i];
    if (option.type === 'home') {
      let page: Page | undefined;
      let uuid: string | undefined;
      Object.keys(pages).forEach((id) => {
        if (pages[id].autogenerate.type === 'home') {
          page = pages[id];
          uuid = id;
        }
      });
      if (page && uuid) {
        if (!option.generate && page.autogenerate.enabled) {
          // Delete this page
          await removeAutoGenerateHomePage(context, uuid);
        }
      } else if (option.generate) {
        await autoGenerateHomePage(context, info, project.project.title);
      }
    } else {
      const event = events[option.uuid as string];
      if (!event) {
        console.error('Failed to find event');
        return new Response(null, {
          status: 500,
          statusText: 'Failed to find event',
        });
      }

      let page: Page | undefined = undefined;
      let pageId;
      for (const id of Object.keys(pages)) {
        const pg = pages[id];
        if (pg.autogenerate.type_id === option.uuid) {
          page = pg;
          pageId = id;
        }
      }

      if (option.generate) {
        if (!page) {
          // Create an auto-gen event page
          await autoGenerateEventPage(
            context,
            info,
            event,
            option.uuid as string
          );
        }
      } else {
        if (page && pageId) {
          // Delete this page
          await removeAutoGenerateEventPage(context, pageId);
        }
      }
    }
  }

  await updateProjectLastUpdated(context);

  const successCommit = await commitAndPush('Updated auto-generate options');

  if (successCommit.error) {
    console.error('Failed to auto-gen data: ', successCommit.error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to auto-gen data: ' + successCommit.error,
    });
  }

  return new Response(JSON.stringify(body), { status: 200 });
};
