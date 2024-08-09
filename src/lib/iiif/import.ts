import type {
  IIIFAnnotationItem,
  IIIFAnnotationPage,
  IIIFAnnotationTarget,
  IIIFPresentationManifest,
  IIIFResource,
} from '@ty/iiif.ts';
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

export const importIIIFManifest = async (
  manifest: string,
  userName: string
) => {
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
  for (let w = 0; w < canvases.length; w++) {
    const c = canvases[w];
    const label = c.label && c.label.en ? c.label.en[0] : '';
    const annoPages = c.items.filter((i) => i.type === 'AnnotationPage');
    const avFiles: { [key: string]: any } = {};
    const eventId = uuidv4();
    const sourceId = uuidv4();
    let avType = 'Audio';
    for (let q = 0; q < annoPages.length; q++) {
      const a = annoPages[q];
      if (a && a.items) {
        a.items.forEach((i) => {
          if (i.type === 'Annotation') {
            if (!Array.isArray(i.body)) {
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
    }
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

    for (let x = 0; x < c.annotations.length; x++) {
      const a = c.annotations[x];
      if (a.type === 'AnnotationPage') {
        const annoFileId = uuidv4();
        const annotations: AnnotationEntry[] = [];
        const label = a.label && a.label.en ? a.label.en[0] : 'default';
        const baseTag = {
          category: '_annotation_sets_',
          tag: label,
        };
        let anno: IIIFAnnotationPage | undefined = undefined;
        if (a.id.endsWith('.json')) {
          const annoResult = await fetch(a.id);
          if (annoResult.ok) {
            anno = await annoResult.json();
          }
        } else {
          anno = a;
        }
        if (anno) {
          anno.items?.forEach((i) => {
            let setTags: Tag[] = [baseTag];
            if (i.type === 'AnnotationPage') {
              const pageLabel =
                anno.label && anno.label.en ? anno.label.en[0] : 'default';
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
              let times = timesRef[1] ? timesRef[1].split(',') : undefined;
              if (!times) {
                // Is there a selector?
                const selTarget = i.target as IIIFAnnotationTarget;
                if (selTarget.selector) {
                  if (selTarget.selector.type === 'PointSelector') {
                    times = [selTarget.selector.t, selTarget.selector.t];
                  } else {
                    times = selTarget.selector.t.split(',');
                  }
                }
              }
              const start = parseFloat(times && times[0] ? times[0] : '0');
              const end = times && times[1] ? parseFloat(times[1]) : undefined;
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
                  }
                });
              }
              annotations.push({
                start_time: start,
                end_time: end || start,
                annotation: nodes,
                tags: tags,
                uuid: uuidv4(),
              });
            }
          });
        }
        result.annotations.push({
          id: annoFileId,
          annotation: {
            event_id: eventId,
            source_id: sourceId,
            annotations: annotations,
          },
        });
      }
    }
  }

  return result;
};
