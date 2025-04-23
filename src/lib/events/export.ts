import { serializeToPlainText, serialize } from '@lib/slate/index.tsx';
import type { AnnotationEntry, Event } from '@ty/Types.ts';
import { formatTimestamp } from './index.ts';
import ReactDOMServer from 'react-dom/server';
import type { Node } from 'slate';

// add another quote to escape any quotes, and surround the value in quotes
// (see https://stackoverflow.com/a/17808731)
const formatField = (str: string) => `"${str.replaceAll('"', '""')}"`;

const serializeRichText = (nodes: Node[]) =>
  ReactDOMServer.renderToString(serialize(nodes));

export const exportAnnotations = (annos: AnnotationEntry[], event: Event) => {
  let str = 'Start Time,End Time,Annotation,Tags (vertical bar separated)\n';

  annos.forEach((anno) => {
    const fields = [
      Number.isInteger(anno.start_time)
        ? formatTimestamp(anno.start_time, false)
        : Number.isNaN(anno.start_time)
        ? ''
        : formatTimestamp(Math.round(anno.start_time), false),
      Number.isInteger(anno.end_time)
        ? formatTimestamp(anno.end_time, false)
        : Number.isNaN(anno.end_time)
        ? ''
        : formatTimestamp(Math.round(anno.end_time), false),
      anno.annotation ? serializeToPlainText(anno.annotation) : '',
      anno.tags.map((t) => t.tag).join('|') || '',
    ];

    str += fields.map(formatField).join(',');
    str += '\n';
  });

  const data = encodeURIComponent(str);

  const el = document.createElement('a');
  el.download = `${event.label}.csv`;
  el.href = 'data:text/csv;charset=UTF-8,' + '\uFEFF' + data;
  el.click();
};

export const exportEvents = (projectName: string, events: Event[]) => {
  let str =
    'Event Label,File Type (Audio or Video),AV File Label (might be the same as event label),AV File URL,Event Citation (optional),Event Description (optional)\n';

  events.forEach((event) => {
    Object.keys(event.audiovisual_files).forEach((uuid) => {
      const fields = [
        event.label,
        event.audiovisual_files[uuid].file_type || event.item_type,
        event.audiovisual_files[uuid].label,
        event.audiovisual_files[uuid].file_url,
        event.citation || '',
        event.description ? serializeToPlainText(event.description) : '',
      ];

      str += fields.map(formatField).join(',');
      str += '\n';
    });
  });

  const data = encodeURIComponent(str);

  const el = document.createElement('a');
  el.download = `${projectName}-events.csv`;
  el.href = 'data:text/csv;charset=UTF-8,' + '\uFEFF' + data;
  el.click();
};
