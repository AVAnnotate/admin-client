import type { GitRepoContext } from '@backend/gitRepo.ts';
import {
  findAutoGenHome,
  ensureUniqueSlug,
  normalizeAndWriteOrder,
} from './index.ts';
import type { FormEvent, Page, UserInfo } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';

export const autoGenerateEventPage = async (
  context: GitRepoContext,
  info: UserInfo,
  ev: FormEvent,
  eventUuid: string
) => {
  const homePageId = await findAutoGenHome(context);

  const slug = ensureUniqueSlug(ev.label, context);

  const eventPage: Page = {
    content: [],
    created_at: new Date().toISOString(),
    created_by: info!.profile.gitHubName || '',
    title: ev.label,
    slug: slug,
    updated_at: new Date().toISOString(),
    updated_by: info!.profile.gitHubName || '',
    autogenerate: {
      enabled: ev.auto_generate_web_page,
      type: 'event',
      type_id: eventUuid,
    },
  };

  const pageId = uuidv4();
  const successPage = await context.writeFile(
    `/data/pages/${pageId}.json`,
    JSON.stringify(eventPage, null, 2)
  );

  if (!successPage) {
    console.error('Failed to write event page');
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write event page',
    });
  }

  const orderFile = context.readFile('/data/pages/order.json');

  const order = JSON.parse(orderFile as string);

  order.push(pageId);

  normalizeAndWriteOrder(context, order);
};

export const removeAutoGenerateEventPage = async (
  context: GitRepoContext,
  pageUuid: string
) => {
  context.deleteFile(`/data/pages/${pageUuid}.json`);

  const orderFile = context.readFile('/data/pages/order.json');

  const order: string[] = JSON.parse(orderFile as string);

  const idx = order.findIndex((o) => o === pageUuid);

  if (idx > -1) {
    order.splice(idx, 1);
  }

  normalizeAndWriteOrder(context, order);
};

export const autoGenerateHomePage = async (
  context: GitRepoContext,
  info: UserInfo,
  title: string
) => {
  const homePage: Page = {
    content: [],
    created_at: new Date().toISOString(),
    created_by: info!.profile.gitHubName || '',
    title: title,
    updated_at: new Date().toISOString(),
    updated_by: info!.profile.gitHubName || '',
    autogenerate: {
      enabled: true,
      type: 'home',
    },
  };

  const pageId = uuidv4();
  const successPage = await context.writeFile(
    `/data/pages/${pageId}.json`,
    JSON.stringify(homePage, null, 2)
  );

  if (!successPage) {
    console.error('Failed to write home page');
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write home page',
    });
  }

  const orderFile = context.readFile('/data/pages/order.json');

  const order = JSON.parse(orderFile as string);

  // Make it top level
  order.unshift(pageId);

  normalizeAndWriteOrder(context, order);
};

export const removeAutoGenerateHomePage = async (
  context: GitRepoContext,
  pageUuid: string
) => {
  context.deleteFile(`/data/pages/${pageUuid}.json`);

  const orderFile = context.readFile('/data/pages/order.json');

  const order: string[] = JSON.parse(orderFile as string);

  const idx = order.findIndex((o) => o === pageUuid);

  if (idx > -1) {
    order.splice(idx, 1);
  }

  normalizeAndWriteOrder(context, order);
};
