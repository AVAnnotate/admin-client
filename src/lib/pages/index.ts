import type { Page } from '@ty/Types.ts';

export interface ListPage extends Page {
  listIndex: number;
}

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
