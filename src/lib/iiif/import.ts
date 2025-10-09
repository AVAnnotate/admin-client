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
  ChoiceBody,
  ExternalWebResource,
  ContentResourceString,
  AnnotationBody,
} from '@iiif/presentation-3';
import type { AnnotationEntry, AnnotationPage, Event, Tag } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';
import { deserialize } from '@lib/slate/deserialize.ts';
import type { Node } from 'slate';
// @ts-ignore
import { JSDOM } from 'jsdom';
import { vttToAnnotations } from '@lib/VTT/index.ts';

const ACCEPTABLE_FORMATS = [
  'audio/mp3',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/vnd.wav',
  'audio/flac',
  'audio/aiff',
  'audio/x-ms-wma',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/x-flv',
  'video/x-matroska',
  'video/x-ms-wmv',
  'video/x-ms-asf',
  'video/x-msvideo',
  'video/quicktime',
  'application/x-mpegURL',
];

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

type AnnoBodyTypes =
  | undefined
  | 'ExternalWebResource'
  | 'ContentResourceString'
  | 'TextualBody'
  | 'ContentResourceArray';

type AnnoBody =
  | IIIFAnnotationBody
  | IIIFAnnotationBody[]
  | ContentResourceString
  | ExternalWebResource
  | string;

const determineAnnotationBodyType = (body: AnnoBody): AnnoBodyTypes => {
  if (!body) {
    return undefined;
  }

  if (
    typeof body !== 'string' &&
    !Array.isArray(body) &&
    body.type === 'Text' &&
    body.id
  ) {
    return 'ExternalWebResource';
  } else if (typeof body === 'string') {
    return 'ContentResourceString';
  } else if (!Array.isArray(body) && body.type === 'TextualBody') {
    return 'TextualBody';
  } else if (Array.isArray(body)) {
    return 'ContentResourceArray';
  }

  return undefined;
};

const parseExternalWebResource = async (
  body: ExternalWebResource,
  eventId: any,
  sourceId: any,
  result: ImportManifestResults
) => {
  const fetchResp = await fetch(body.id as string);

  if (fetchResp.ok) {
    const data = await fetchResp.text();

    let annotations: AnnotationEntry[] = [];
    if (body.format === 'text/vtt') {
      annotations = vttToAnnotations(data, undefined);
    }

    const setId = uuidv4();
    result.annotations.push({
      id: setId,
      annotation: {
        event_id: eventId,
        source_id: sourceId,
        // @ts-ignore
        set: getLabel((body as ExternalWebResource).label),
        annotations: annotations,
      },
    });
  } else {
    console.error(
      'Fetching external web resource failed: ',
      fetchResp.status,
      fetchResp.statusText
    );
  }
};

const parseContentResourceString = (
  body: AnnoBody,
  start: number,
  end: number,
  tags: Tag[],
  annotations: AnnotationEntry[]
) => {
  let nodes: Node[] = [];
  const document = JSDOM.fragment(`${body as ContentResourceString as string}`);
  nodes = deserialize(document);

  annotations.push({
    start_time: start,
    end_time: end || start,
    annotation: nodes,
    tags: tags,
    uuid: uuidv4(),
  });
};

const parseTextualBody = (
  body: AnnoBody,
  start: number,
  end: number,
  tags: Tag[],
  annotations: AnnotationEntry[]
) => {
  let nodes: Node[] = [];
  const document = JSDOM.fragment(
    `${(body as EmbeddedResource).value as string}`
  );
  nodes = deserialize(document);

  annotations.push({
    start_time: start,
    end_time: end || start,
    annotation: nodes,
    tags: tags,
    uuid: uuidv4(),
  });
};

const parseContentResourceArray = (
  body: AnnotationBody[],
  start: number,
  end: number,
  tags: Tag[],
  annotations: AnnotationEntry[],
  result: ImportManifestResults
) => {
  let nodes: Node[] = [];
  body.forEach((b) => {
    if ((b as ContentResource).motivation === 'tagging') {
      tags.push({
        category: '_uncategorized_',
        tag: (b as EmbeddedResource).value as string,
      });
      if (
        result.tags.findIndex((t) => t === (b as EmbeddedResource).value) === -1
      ) {
        result.tags.push((b as EmbeddedResource).value as string);
      }
    } else {
      const document = JSDOM.fragment(
        `${(b as EmbeddedResource).value as string}`
      );
      const res = deserialize(document);
      nodes = [...nodes, ...res];
    }
  });

  annotations.push({
    start_time: start,
    end_time: end || start,
    annotation: nodes,
    tags: tags,
    uuid: uuidv4(),
  });
};

const isValidUrl = (url: string) => {
  console.info(`Testing URL string ${url}`);
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const fetchAnnoPage = async (url: string) => {
  const fetchResp = await fetch(url);

  if (fetchResp.ok) {
    const data: IIIFAnnotationPage = await fetchResp.json();

    return data;
  }

  return undefined;
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

  const maniLabel = mani.label ? getLabel(mani.label) : undefined;

  // Label count
  let avLabelCount: number = 1;

  // For each canvas create an event
  for (let w = 0; w < canvases.length; w++) {
    const c = canvases[w];
    const label = c.label ? getLabel(c.label) : '';
    // @ts-ignore
    let annoPages: IIIFAnnotationPage[] = c.items?.filter(
      (i) => i.type === 'AnnotationPage'
    );
    const avFiles: { [key: string]: any } = {};
    const eventId = uuidv4();
    const sourceId = uuidv4();

    // Add any items in the annotations list to the anno pages
    if (c.annotations) {
      annoPages = [
        ...annoPages,
        ...c.annotations?.filter((i) => i.type === 'AnnotationPage'),
      ];
    }
    if (annoPages) {
      for (let q = 0; q < annoPages.length; q++) {
        let a: IIIFAnnotationPage | undefined = annoPages[q];
        // console.info(`Anno Page: ${JSON.stringify(a, null, 2)}`);
        if (!a.items && isValidUrl(a.id)) {
          a = await fetchAnnoPage(a.id);
        }
        if (a && a.items) {
          a.items.forEach((i) => {
            if (i.type === 'Annotation' && i.motivation === 'painting') {
              if (i.body) {
                if (typeof i.body !== 'string') {
                  if (!Array.isArray(i.body)) {
                    if (i.body.type === 'Choice') {
                      const b: ChoiceBody = i.body;

                      // We are going to take the first one that has an acceptable format
                      for (
                        let i = 0;
                        i < (b.items as ExternalWebResource[]).length;
                        i++
                      ) {
                        const wr = b.items[i] as ExternalWebResource;
                        if (ACCEPTABLE_FORMATS.includes(wr.format as string)) {
                          avFiles[sourceId] = {
                            // @ts-ignore
                            label: wr.label
                              ? // @ts-ignore
                                getLabel(wr.label)
                              : `AV File ${avLabelCount++}`,
                            file_url: wr.id,
                            // @ts-ignore
                            duration: wr.duration || 0,
                            file_type: wr.type === 'Sound' ? 'Audio' : 'Video',
                          };
                          break;
                        }
                      }
                    } else {
                      console.log('Not choice!');
                      const b: ContentResource = i.body as ContentResource;
                      avFiles[sourceId] = {
                        label: `AV File ${avLabelCount++}`,
                        file_url: b.id,
                        // @ts-ignore
                        duration: b.duration || 0,
                        file_type: b.type === 'Sound' ? 'Audio' : 'Video',
                      };
                    }
                  } else {
                    const ba: IIIFResource[] = i.body as IIIFResource[];
                    ba.forEach((b) => {
                      avFiles[sourceId] = {
                        label: `AV File ${avLabelCount++}`,
                        file_url: b.id,
                        duration: b.duration || 0,
                        file_type: b.type === 'Sound' ? 'Audio' : 'Video',
                      };
                    });
                  }
                }
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
        label: label
          ? label
          : maniLabel || `Imported Event ${result.events.length + 1}`,
        updated_at: new Date().toISOString(),
        updated_by: userName,
        rights_statement: mani.rights ? ensureHTTPS(mani.rights) : '',
      },
    });

    if (c.annotations && c.annotations.length > 0) {
      let isExternal = false;
      for (let x = 0; x < c.annotations.length; x++) {
        const a = c.annotations[x];
        if (a.type === 'AnnotationPage') {
          const annoFileId = uuidv4();
          const setTags: Tag[] = [];
          let annotations: AnnotationEntry[] = [];
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
          if (anno && anno.items) {
            for (let k = 0; k < anno.items.length; k++) {
              let item = anno.items[k];
              if (item.type === 'Annotation' && item.body) {
                const { start, end } = getTime(item.target as Target, map);
                let nodes: Node[] = [];
                const tags: Tag[] = [...setTags];
                const body: AnnoBody = item.body;

                switch (determineAnnotationBodyType(body)) {
                  case undefined:
                    continue;
                  case 'ExternalWebResource':
                    await parseExternalWebResource(
                      body as ExternalWebResource,
                      eventId,
                      sourceId,
                      result
                    );
                    isExternal = true;
                    break;
                  case 'ContentResourceString':
                    parseContentResourceString(
                      body,
                      start,
                      end,
                      tags,
                      annotations
                    );
                    break;
                  case 'TextualBody':
                    parseTextualBody(body, start, end, tags, annotations);
                    break;
                  case 'ContentResourceArray':
                    parseContentResourceArray(
                      body as AnnotationBody[],
                      start,
                      end,
                      tags,
                      annotations,
                      result
                    );
                    break;
                }
              }
            }
            if (!isExternal) {
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
    }
  }

  return result;
};

const ensureHTTPS = (str: string) => {
  return str.replace('http:', 'https:');
};
const removeTrailingSlash = (str: string) => {
  return str.replace(/\/+$/, '');
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
