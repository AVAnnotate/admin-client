import type { IIIFPresentationManifest, IIIFResource } from '@ty/iiif.ts';
import type { AnnotationEntry, AnnotationPage, Event, Tag } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';
import { deserialize } from '@lib/slate/deserialize.ts';
import type { Node } from 'slate';
// @ts-ignore
import { JSDOM } from 'jsdom';

export type ImportManifestResults = {
  events: { id: string; event: Event }[];
  annotations: { id: string; annotation: AnnotationPage }[];
};

export const importIIIFManifest = (manifest: string, userName: string) => {
  const mani: IIIFPresentationManifest = JSON.parse(manifest);

  const result: ImportManifestResults = {
    events: [],
    annotations: [],
  };

  // Get the items
  const items = mani.items;

  // Look for canvases
  const canvases = items.filter((i) => i.type === 'Canvas');

  // For each canvas create an event
  canvases.forEach((c) => {
    const label = c.label && c.label.en ? c.label.en[0] : '';
    const annoPages = c.items.filter((i) => i.type === 'AnnotationPage');
    const avFiles: { [key: string]: any } = {};
    const eventId = uuidv4();
    const sourceId = uuidv4();
    let avType = 'Audio';
    annoPages.forEach((a) => {
      if (a.items) {
        a.items.forEach((i) => {
          if (
            i.type === 'Annotation' &&
            i.motivation === 'painting' &&
            i.body
          ) {
            if (typeof i.body === 'object') {
              const b: IIIFResource = i.body as IIIFResource;
              avType = b.type;
              avFiles[sourceId] = {
                label: '',
                file_url: b.id,
                duration: b.duration,
              };
            } else {
              const ba: IIIFResource[] = i.body as IIIFResource[];
              ba.forEach((b) => {
                avType = b.type;
                avFiles[sourceId] = {
                  label: '',
                  file_url: b.id,
                  duration: b.duration,
                };
              });
            }
          }
        });
      }
    });
    result.events.push({
      id: eventId,
      event: {
        audiovisual_files: avFiles,
        auto_generate_web_page: true,
        description: [
          {
            type: 'paragraph',
            children: [
              {
                text: label,
              },
            ],
          },
        ],
        citation: undefined,
        created_at: new Date().toISOString(),
        created_by: userName,
        item_type: avType === 'Video' ? 'Video' : 'Audio',
        label: `Imported Event ${result.events.length + 1}`,
        updated_at: new Date().toISOString(),
        updated_by: userName,
      },
    });

    c.annotations.forEach((a) => {
      if (a.type === 'AnnotationPage') {
        const annoFileId = uuidv4();
        const annotations: AnnotationEntry[] = [];
        const label = a.label && a.label.en ? a.label.en[0] : 'default';
        const baseTag = {
          category: '_annotation_sets_',
          tag: label,
        };
        a.items?.forEach((i) => {
          let setTags: Tag[] = [baseTag];
          if (i.type === 'AnnotationPage') {
            const pageLabel = a.label && a.label.en ? a.label.en[0] : 'default';
            setTags = [
              ...setTags,
              {
                category: '_annotation_sets_',
                tag: pageLabel,
              },
            ];
          } else if (i.type === 'Annotation') {
            const timesRef =
              typeof i.target === 'string'
                ? i.target.split('#t=')
                : i.target.source.id.split('#t=');
            const times = timesRef[1] ? timesRef[1].split(',') : ['0', '0'];
            const start = parseFloat(times[0]);
            const end = times[1] ? parseFloat(times[1]) : undefined;
            let nodes: Node[] = [];
            let tags: Tag[] = [...setTags];
            if (!Array.isArray(i.body)) {
              const document = JSDOM.fragment(
                `${(i.body as IIIFResource).value as string}`
              );
              nodes = deserialize(document);
            } else {
              (i.body as IIIFResource[]).forEach((b) => {
                if (b.purpose === 'tagging') {
                  tags.push({
                    category: '_uncategorized_',
                    tag: b.value as string,
                  });
                } else {
                  const document = JSDOM.fragment(`${b.value as string}`);
                  const res = deserialize(document);
                  nodes = [...nodes, ...res];
                  // console.log('nodes: ', nodes);
                }
              });
            }
            // console.log('Tags: ', tags);
            annotations.push({
              start_time: start,
              end_time: end || start,
              annotation: nodes,
              tags: tags,
              uuid: uuidv4(),
            });
          }
        });
        result.annotations.push({
          id: annoFileId,
          annotation: {
            event_id: eventId,
            source_id: sourceId,
            annotations: annotations,
          },
        });
      }
    });
  });

  return result;
};
