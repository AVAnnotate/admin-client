import type { Page } from "@ty/Types.ts";

export const sortPages = (pageData: { [key: string]: Page }) => {
  return Object.keys(pageData)
    .sort((a, b) => {
      const pageA = pageData[a]
      const pageB = pageData[b]

      // To account for nested pages, we create these sort values that
      // take into account a page's parent's order, if applicable.
      const pageASortVal = pageA.parent
        ? `${pageData[pageA.parent].order}-${pageA.order}`
        : pageA.order

      const pageBSortVal = pageB.parent
        ? `${pageData[pageB.parent].order}-${pageB.order}`
        : pageA.order

      if (pageBSortVal > pageASortVal) {
        return 1
      } else if (pageBSortVal < pageASortVal) {
        return -1
      } else {
        return 0
      }
    })
}

export const changeOrder = (pages: { [key: string]: Page }, uuid: string, newOrder: number, oldOrder: number) => {
  const newPages: { [key: string]: Page } = { ...pages }

  if (pages[uuid].parent) {
    Object.keys(newPages).forEach(key => {
      if (key === uuid) {
        newPages[key].order = newOrder
      } else if (newPages[key].order > newOrder && newPages[key].order < oldOrder) {
        newPages[key].order += 1
      }
    })
  }

  return newPages;
}
