import { serialize } from '@lib/slate/index.tsx';
import type { AnnotationEntry, Event } from '@ty/Types.ts';
import { formatTimestamp } from './index.ts';
import ReactDOMServer from 'react-dom/server';
import type { Node } from 'slate';

// add a \ to escape any quotes, and surround the value in quotes
const formatField = (str: string) => `"${str.replaceAll('"', '\\"')}"`;

const serializeRichText = (nodes: Node[]) =>
  ReactDOMServer.renderToString(serialize(nodes));

export const exportAnnotations = (
  annos: AnnotationEntry[],
  event: Event,
  avFile: string
) => {
  let str =
    'Start Time,End Time,Annotation,Tags (comma separated),AV Label (optional for single-file events)\n';

  annos.forEach((anno) => {
    const fields = [
      Number.isInteger(anno.start_time)
        ? formatTimestamp(anno.start_time, false)
        : '',
      Number.isInteger(anno.end_time)
        ? formatTimestamp(anno.end_time, false)
        : '',
      anno.annotation ? serializeRichText(anno.annotation) : '',
      anno.tags.map((t) => t.tag).join(',') || '',
      event.audiovisual_files[avFile].label || '',
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
    'Event Label,Event Item Type (Audio or Visual),AVFile Label (might be the same as event label),AV File URL,Event Citation (optional),Event Description (optional)\n';

  events.forEach((event) => {
    Object.keys(event.audiovisual_files).forEach((uuid) => {
      const fields = [
        event.label,
        event.item_type,
        event.audiovisual_files[uuid].label,
        event.audiovisual_files[uuid].file_url,
        event.citation || '',
        event.description ? serializeRichText(event.description) : '',
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
