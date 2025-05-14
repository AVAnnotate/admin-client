import type { ProjectData } from '@ty/Types.ts';

export interface OrderEntry {
  id: string;
  parent?: string;
  children: string[];
  allChildren: string[];
  title?: string;
}

const getChildrenEntries = (
  pageArray: OrderEntry[],
  entry: OrderEntry,
  order: string[]
) => {
  entry.children.forEach((c) => {
    order.push(c);
    const childEntry = pageArray.find((e) => e.id === c);
    if (childEntry) {
      getChildrenEntries(pageArray, childEntry, order);
    }
  });
};

export const getOrderFromPageArray = (pageArray: OrderEntry[]) => {
  let order: string[] = [];

  pageArray
    .filter((p) => !p.parent)
    .forEach((entry) => {
      order.push(entry.id);
      getChildrenEntries(pageArray, entry, order);
    });

  return order;
};

export const makePageArray = (project: ProjectData, order: string[]) => {
  const pageArray: OrderEntry[] = [];
  order.forEach((id) => {
    const page = project.pages[id];
    pageArray.push({
      id: id,
      title: page.title,
      parent: page.parent,
      children: [],
      allChildren: [],
    });
  });

  pageArray.forEach((entry) => {
    const page = project.pages[entry.id];
    const idx = pageArray.findIndex((e) => e.id === entry.id);

    if (idx > -1) {
      let entry = pageArray[idx];
      if (page.parent) {
        entry.parent = page.parent;
        const idxParent = pageArray.findIndex((e) => e.id === page.parent);
        if (idxParent > -1) {
          let parentEntry = pageArray[idxParent];
          parentEntry.children.push(entry.id);
          parentEntry.allChildren.push(entry.id);
          let parent = parentEntry.parent;
          while (parent) {
            const idxNextParent = pageArray.findIndex((e) => e.id === parent);
            if (idxNextParent > -1) {
              let nextParentEntry = pageArray[idxNextParent];
              nextParentEntry.allChildren.push(entry.id);
              parent = nextParentEntry.parent;
            }
          }
        }
      }
    }
  });

  return pageArray;
};
