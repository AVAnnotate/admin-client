import type { Page } from '@ty/Types.ts';

export interface ListPage extends Page {
  listIndex: number;
}

export const sortPages = (pageData: { [key: string]: Page }) => {
  const sortedUuids = Object.keys(pageData).sort((a, b) => {
    const pageA = pageData[a];
    const pageB = pageData[b];

    // To account for nested pages, we create these sort values that
    // take into account a page's parent's order, if applicable.
    const pageASortVal = pageA.parent
      ? `${pageData[pageA.parent].order}-${pageA.order}`
      : pageA.order;

    const pageBSortVal = pageB.parent
      ? `${pageData[pageB.parent].order}-${pageB.order}`
      : pageA.order;

    if (pageBSortVal > pageASortVal) {
      return 1;
    } else if (pageBSortVal < pageASortVal) {
      return -1;
    } else {
      return 0;
    }
  });

  return sortedUuids;
};

const reorder = (
  pages: { [key: string]: Page },
  keys: string[],
  uuid: string,
  newOrder: number,
  oldOrder: number
) => {
  keys.forEach((key) => {
    if (key === uuid) {
      pages[key].order = newOrder;
    } else if (pages[key].order > newOrder && pages[key].order < oldOrder) {
      pages[key].order += 1;
    }
  });
};

export const changeOrder = (
  pages: { [key: string]: Page },
  uuid: string,
  newOrder: number,
  oldOrder: number
) => {
  const newPages: { [key: string]: Page } = { ...pages };

  if (pages[uuid].parent) {
    const siblings = Object.keys(newPages).filter(
      (key) => newPages[key].parent === newPages[uuid].parent
    );

    reorder(newPages, siblings, uuid, newOrder, oldOrder);
  } else {
    reorder(newPages, Object.keys(newPages), uuid, newOrder, oldOrder);
  }

  return newPages;
};
