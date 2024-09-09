import type {
  AnnotationEntry,
  FormEvent,
  ParseAnnotationResults,
  Tag,
  Tags,
} from '@ty/Types.ts';
import { read, utils } from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import tagColors from '@lib/tag-colors.ts';
import { fromTimestamp } from '@lib/events/index.ts';
import { deserialize } from '@lib/slate/deserialize.ts';
import { emptyParagraph } from '@lib/slate/index.tsx';

export const parseSpreadsheetData = async (
  data: File,
  hasColumnHeaders: boolean
): Promise<ParseAnnotationResults> => {
  const workbook = read(await data.arrayBuffer(), { type: 'array' });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  const annotations: any[] = utils.sheet_to_json(firstSheet, {
    header: 1,
    raw: false,
  });

  let headers: string[] = [];
  if (hasColumnHeaders) {
    headers = [...annotations[0]];
    annotations.shift();
  }

  const ret: ParseAnnotationResults = {
    headers,
    rowCount: annotations.length,
    data: annotations,
  };

  return ret;
};

const getTag = (tag: string, tags: Tags) => {
  // Find this tag if we have it
  // If it has a colon then look for that category specifically
  let ret: Tag | undefined;
  const catArray = tag.split(';');
  let category;
  let searchTag = tag.trim();
  if (catArray.length > 1) {
    category = catArray[0];
    searchTag = catArray[1];
  }

  if (category) {
    // Look for this category
    const findIdx = tags.tagGroups.findIndex((g) => g.category === category);
    if (findIdx > -1) {
      const tagIdx = tags.tags.findIndex(
        (t) => t.category === category && t.tag === searchTag
      );
      if (tagIdx > -1) {
        ret = tags.tags[tagIdx];
      }
    }
  } else {
    // Look for this tag in any category
    const tagIdx = tags.tags.findIndex((t) => t.tag === searchTag);
    if (tagIdx > -1) {
      ret = tags.tags[tagIdx];
    }
  }

  return ret;
};

// Prepare the annotations for the POST request.
// Note that we don't assign UUIDs here. That is handled
// on the backend.
export const mapAnnotationData = (
  data: any[],
  map: { [key: string]: number },
  tags: Tags
): Omit<AnnotationEntry, 'uuid'>[] => {
  const ret: Omit<AnnotationEntry, 'uuid'>[] = [];

  data.forEach((d) => {
    const template = document.createElement('template');
    template.innerHTML = d[map['annotation']];

    let annotation = deserialize(template.content.firstChild!);

    // handle plan text imports, which need to be in a paragraph node
    if (!Array.isArray(annotation)) {
      annotation = [
        {
          ...emptyParagraph,
          children: [annotation],
        },
      ];
    }

    const tMap: Tag[] = [];
    d[map['tags']]
      ? (d[map['tags']] as string).split(',').forEach((tag) => {
          const found = getTag(tag, tags);
          if (found) {
            tMap.push(found);
          }
        })
      : [];
    ret.push({
      start_time: fromTimestamp(d[map['start_time']]),
      end_time: fromTimestamp(d[map['end_time']]),
      annotation,
      tags: tMap,
    });
  });

  return ret;
};

export const mapTagData = (
  data: any[],
  map: { [key: string]: number }
): Tags => {
  const ret: Tags = {
    tagGroups: [],
    tags: [],
  };

  let colorIndex = 0;
  data.forEach((d) => {
    if (d[map['tag_name']]) {
      const category = d[map['tag_category']] || '_uncategorized_'
      if (!ret.tagGroups.find((g) => g.category === category)) {
        ret.tagGroups.push({
          category: category.trim(),
          color: tagColors[colorIndex++],
        });
      }
      ret.tags.push({
        tag: d[map['tag_name']].trim(),
        category: category.trim(),
      });
    }
  });

  return ret;
};

export const mapEventData = (
  data: any[],
  map: { [key: string]: number },
  autoGenerateWebpage: boolean
): FormEvent[] => {
  return data.map((item) => ({
    audiovisual_files: {
      [uuidv4()]: {
        label: item[map['audiovisual_file_label']],
        is_offline: false,
        file_url: item[map['audiovisual_file_url']],
        duration: item[map['audiovisual_file_duration']],
      },
    },
    auto_generate_web_page: autoGenerateWebpage,
    citation: item[map['citation']],
    item_type: item[map['item_type']],
    label: item[map['label']],
    description: item[map['description']],
  }));
};
