import type { GitRepoContext } from '@backend/gitRepo.ts';
import {
  findAutoGenHome,
  trimStringToMaxLength,
  ensureUniqueSlug,
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
    parent: homePageId,
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

  const successOrder = await context.writeFile(
    '/data/pages/order.json',
    JSON.stringify(order, null, 2)
  );

  if (!successOrder) {
    console.error('Failed to write page order');
    return new Response(null, {
      status: 500,
      statusText: 'Failed to write page order',
    });
  }
};
