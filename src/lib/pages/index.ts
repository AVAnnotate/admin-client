import type { Page, ProjectFile } from '@ty/Types.ts';
import type { GitRepoContext } from '@backend/gitRepo.ts';
import slugify from 'slugify';

const MAX_SLUG_LENGTH = 20;

export const getNewOrder = (
  allPages: { [key: string]: Page },
  uuid: string,
  orderFileContent: string[],
  oldPage?: Page
): string[] => {
  const newPage = allPages[uuid];

  // return the same order file content if the parent didn't change
  // (the only way to change the page order from the page edit form
  // is to add/remove/change the page's parent UUID)
  if (oldPage && oldPage.parent === newPage.parent) {
    return orderFileContent;
  }

  const newOrder = orderFileContent.filter((item) => item !== uuid);

  // bump it to the bottom if we removed the page's parent
  if (oldPage && oldPage.parent && !newPage.parent) {
    newOrder.push(uuid);
    return newOrder;
  }

  // if it's a new page with no parent, add it straight to the bottom
  if (!oldPage && !newPage.parent) {
    newOrder.push(uuid);
    return newOrder;
  }

  // all parent pages, sorted by their order file index
  const parentPages = (
    Object.keys(allPages)
      .map((pageUuid) => {
        if (!allPages[pageUuid].parent) {
          return { uuid: pageUuid, idx: newOrder.indexOf(pageUuid) };
        }
      })
      .filter(Boolean) as { uuid: string; idx: number }[]
  ).sort((a, b) => {
    if (a.idx > b.idx) {
      return 1;
    } else if (b.idx > a.idx) {
      return -1;
    }

    return 0;
  });

  // if we just added a parent to a previously parentless page, add it to the
  // bottom of that parent's list of children
  const parentPage = parentPages.find((pp) => pp.uuid === newPage.parent);

  if (!parentPage) {
    throw new Error("Parent page doesn't exist in project.");
  }

  const nextParentPage =
    parentPages[parentPages.map((pp) => pp.idx).indexOf(parentPage.idx) + 1];

  // if the chosen parent page is at the end, we can just push the UUID to the bottom
  if (!nextParentPage) {
    newOrder.push(uuid);
  } else {
    newOrder.splice(nextParentPage.idx, 0, uuid);
  }

  return newOrder;
};

export const findAutoGenHome = async (
  context: GitRepoContext
): Promise<string | undefined> => {
  const { readFile, exists } = context;

  // Get the order file
  const orderFile = readFile('/data/pages/order.json');

  const order: string[] = JSON.parse(orderFile.toString());

  for (let i = 0; i < order.length; i++) {
    if (exists(`/data/pages/${order[i]}.json`)) {
      const pageFile = readFile(`/data/pages/${order[i]}.json`);

      const page: Page = JSON.parse(pageFile.toString());

      if (
        page.autogenerate &&
        page.autogenerate.enabled &&
        page.autogenerate.type === 'home'
      ) {
        return order[i];
      }
    }
  }
};

export const updateProjectLastUpdated = async (
  context: GitRepoContext
): Promise<boolean> => {
  const { readFile, writeFile, exists } = context;

  if (exists('/data/project.json')) {
    const project: ProjectFile = JSON.parse(
      readFile('/data/project.json') as string
    );

    project.project.updated_at = new Date().toISOString();

    const res = await writeFile(
      '/data/project.json',
      JSON.stringify(project, null, 2)
    );

    if (res) {
      return true;
    }
  }

  return false;
};

export const trimStringToMaxLength = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  } else {
    return str.slice(0, maxLength);
  }
};

export const ensureUniqueSlug = (slugIn: string, context: GitRepoContext) => {
  const slug = trimStringToMaxLength(slugIn, MAX_SLUG_LENGTH);

  // @ts-ignore
  let ret = slugify(slug, { lower: true, strict: true });

  const { readDir, readFile } = context;

  const pages = readDir('/data/pages');
  let num = 2;
  let repeat = true;
  while (repeat) {
    const start = num;
    pages
      .filter(
        (filename) => filename !== '.gitkeep' && filename !== 'order.json'
      )
      .forEach((filename) => {
        const page: Page = JSON.parse(
          readFile(`/data/pages/${filename}`) as string
        );

        if (page.slug === ret) {
          if (slug.length >= MAX_SLUG_LENGTH - 1) {
            ret = ret.slice(0, -1) + `-${num++}`;
          } else {
            ret = ret + `-${num++}`;
          }
        }
      });

    if (num === start) {
      repeat = false;
    }
  }

  return ret;
};
