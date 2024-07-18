import type { Page } from '@ty/Types.ts';
import type { Descendant } from 'slate';

export const getNewOrder = (
  allPages: { [key: string]: Page },
  uuid: string,
  orderFileContent: string[]
) => {
  const newOrder = orderFileContent.filter((item) => item !== uuid);

  if (allPages[uuid].parent) {
    // insert the page as the final child under its parent
    const parentIdx = newOrder.indexOf(allPages[uuid].parent!);

    if (parentIdx === newOrder.length - 1) {
      // if the parent is the last element in the array,
      // we can just push to the end
      newOrder.push(uuid);
    } else {
      const nextParentIdx =
        newOrder.slice(parentIdx + 1).findIndex((key) => {
          return !allPages[key].parent;
        }) +
        parentIdx +
        1;

      // if the page's parent is the last parent-level
      // page in the project, then place the new page
      // at the bottom
      if (nextParentIdx === -1) {
        newOrder.push(uuid);
      } else {
        newOrder.splice(nextParentIdx, 0, uuid);
      }
    }
  } else {
    newOrder.push(uuid);
  }

  return newOrder;
};

export const initialPageValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];
