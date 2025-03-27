import type {
  AnnotationPage as IIIFAnnotationPage,
  Annotation as IIIFAnnotation,
  Manifest as IIIFPresentationManifest,
  Canvas as IIIFCanvas,
  AnnotationTarget as IIIFAnnotationTarget,
  IIIFExternalWebResource as IIIFResource,
  AnnotationBody as IIIFAnnotationBody,
  Target,
  ContentResource,
  EmbeddedResource,
} from '@iiif/presentation-3';
import type { AnnotationEntry, AnnotationPage, Event, Tag } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';
import { deserialize } from '@lib/slate/deserialize.ts';
import type { Node } from 'slate';
// @ts-ignore
import { JSDOM } from 'jsdom';

type AVFileMap = {
  [canvas: string]: {
    avFileUrl: string;
    startDuration: number;
    endDuration: number;
  }[];
};

export type ImportManifestResults = {
  events: { id: string; event: Event }[];
  annotations: { id: string; annotation: AnnotationPage }[];
  tags: string[];
};

export const importIIIFManifest = async (
  manifest: string,
  userName: string
) => {
  const mani: IIIFPresentationManifest = JSON.parse(manifest);

  const result: ImportManifestResults = {
    events: [],
    annotations: [],
    tags: [],
  };

  // Get the items
  const items = mani.items;

  // Look for canvases
  const canvases = items.filter((i) => i.type === 'Canvas');
  const map = getAVMap(canvases);

  // Label count
  let avLabelCount: number = 1;

  // For each canvas create an event
  for (let w = 0; w < canvases.length; w++) {
    const c = canvases[w];
    const label = c.label && c.label.en ? c.label.en[0] : '';
    const annoPages = c.items?.filter((i) => i.type === 'AnnotationPage');
    const avFiles: { [key: string]: any } = {};
    const eventId = uuidv4();
    const sourceId = uuidv4();
    let avType = 'Audio';
    if (annoPages) {
      for (let q = 0; q < annoPages.length; q++) {
        const a = annoPages[q];
        if (a && a.items) {
          a.items.forEach((i) => {
            if (i.type === 'Annotation') {
              if (!Array.isArray(i.body)) {
                const b: IIIFResource = i.body as IIIFResource;
                avType = b.type;
                avFiles[sourceId] = {
                  label: `AV File ${avLabelCount++}`,
                  file_url: b.id,
                  duration: b.duration || 0,
                };
              } else {
                const ba: IIIFResource[] = i.body as IIIFResource[];
                ba.forEach((b) => {
                  avType = b.type;
                  avFiles[sourceId] = {
                    label: `AV File ${avLabelCount++}`,
                    file_url: b.id,
                    duration: b.duration || 0,
                  };
                });
              }
            }
          });
        }
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
        label: mani.label.en
          ? mani.label.en[0]
          : `Imported Event ${result.events.length + 1}`,
        updated_at: new Date().toISOString(),
        updated_by: userName,
      },
    });

    if (c.annotations && c.annotations.length > 0) {
      for (let x = 0; x < c.annotations.length; x++) {
        const a = c.annotations[x];
        if (a.type === 'AnnotationPage') {
          const annoFileId = uuidv4();
          const annotations: AnnotationEntry[] = [];
          const label = getLabel(a.label);
          let anno: IIIFAnnotationPage | undefined = undefined;
          if (a.id.endsWith('.json') && !a.items) {
            const annoResult = await fetch(a.id);
            if (annoResult.ok) {
              anno = await annoResult.json();
            }
          } else {
            anno = a;
          }
          if (anno) {
            anno.items?.forEach((i) => {
              const setTags: Tag[] = [];
              if (i.type === 'Annotation') {
                const { start, end } = getTime(i.target as Target, map);
                let nodes: Node[] = [];
                const tags: Tag[] = [...setTags];
                const body:
                  | IIIFAnnotationBody
                  | IIIFAnnotationBody[]
                  | undefined = i.body;
                if (!Array.isArray(body)) {
                  const document = JSDOM.fragment(
                    `${(body as EmbeddedResource).value as string}`
                  );
                  nodes = deserialize(document);
                } else {
                  nodes = [];
                  body.forEach((b) => {
                    if ((b as ContentResource).motivation === 'tagging') {
                      tags.push({
                        category: '_uncategorized_',
                        tag: (b as EmbeddedResource).value as string,
                      });
                      if (
                        result.tags.findIndex(
                          (t) => t === (b as EmbeddedResource).value
                        ) === -1
                      ) {
                        result.tags.push(
                          (b as EmbeddedResource).value as string
                        );
                      }
                    } else {
                      const document = JSDOM.fragment(
                        `${(b as EmbeddedResource).value as string}`
                      );
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
              set: label,
              annotations: annotations,
            },
          });
        }
      }
    }
  }

  return result;
};

const getLabel = (label: any) => {
  if (label) {
    if (label.en) {
      return label.en[0];
    } else if (label.none) {
      return label.none[0];
    }
  }

  return 'default';
};

const getTime = (target: IIIFAnnotationTarget | string, map: AVFileMap) => {
  const ret: { url: string | undefined; start: number; end: number } = {
    url: undefined,
    start: 0,
    end: 0,
  };
  if (typeof target === 'string') {
    const timesRef = target.split('#t=');
    const times = timesRef[1] ? timesRef[1].split(',') : [];

    const mapEntry = map[timesRef[0]];
    if (mapEntry) {
      const filtered = mapEntry.filter(
        (e) =>
          e.startDuration >= parseFloat(times[0]) &&
          e.endDuration <= parseFloat(times[1])
      );
      if (filtered.length > 0 && times.length > 0) {
        ret.url = filtered[0].avFileUrl;
        ret.start = parseFloat(times[0]) + filtered[0].startDuration;
        ret.end = parseFloat(times[1]) + filtered[0].startDuration;
      } else if (times.length > 0) {
        ret.url = timesRef[0];
        ret.start = parseFloat(times[0]);
        ret.end = parseFloat(times[1]);
      }
    }
  }

  return ret;
};

const getAVMap = (canvases: IIIFCanvas[]) => {
  // A Canvas can contain multiple AV files.
  // When a Canvas is targeted, we need to determine
  // which AV File is being referenced
  let map: AVFileMap = {};
  canvases.forEach((c) => {
    let duration = c.duration;
    let start = 0;
    c.items?.forEach((i) => {
      if (i.type === 'AnnotationPage') {
        i.items?.forEach((p, idx) => {
          if (p.motivation === 'painting') {
            const decoded = decodeURIComponent(
              (p.body as IIIFResource).id as string
            );
            const url = decoded.split('?');
            if (!map[c.id]) {
              map[c.id] = [];
            }
            map[c.id].push({
              avFileUrl: url[0],
              startDuration: start,
              endDuration:
                start + ((p.body as IIIFResource).duration as number),
            });
          }
        });
      }
    });
  });

  return map;
};
