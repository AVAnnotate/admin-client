import type { Tags } from '@ty/Types.ts';

export const exportTags = (tags: Tags, projectName: string) => {
  let str = 'Tag, Category\n';

  tags.tags.forEach((tag) => {
    str += tag.tag;
    str += ',';
    str += tag.category;
    str += '\n';
  });

  const data = encodeURIComponent(str);

  const el = document.createElement('a');
  el.download = `${projectName}-tags.csv`;
  el.href = 'data:text/csv;charset=UTF-8,' + '\uFEFF' + data;
  el.click();
};
