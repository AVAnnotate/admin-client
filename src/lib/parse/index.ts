/* eslint-disable @typescript-eslint/no-unused-expressions */
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
    blankrows: false,
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
    category = catArray[0].trim();
    searchTag = catArray[1].trim();
  }

  if (category) {
    // Look for this category
    const findIdx = tags.tagGroups.findIndex(
      (g) => g.category.toLowerCase() === category.toLowerCase()
    );
    if (findIdx > -1) {
      const tagIdx = tags.tags.findIndex(
        (t) =>
          t.category.toLowerCase() === category.toLowerCase() &&
          t.tag.toLowerCase() === searchTag.toLowerCase()
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
export const mapAnnotationData = async (
  data: any[],
  map: { [key: string]: number },
  tagsIn: Tags,
  projectSlug: string
): Promise<Omit<AnnotationEntry, 'uuid'>[]> => {
  const ret: Omit<AnnotationEntry, 'uuid'>[] = [];
  const tags: Tags = JSON.parse(JSON.stringify(tagsIn));
  const availableColors = tagColors.filter(
    (c) => tags.tagGroups.findIndex((g) => g.color === c) === -1
  );
  let tagsUpdated = false;

  data.forEach((d) => {
    const template = document.createElement('template');
    template.innerHTML = d[map['annotation']];

    let annotation = deserialize(template.content);

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
      ? (d[map['tags']] as string).split('|').forEach((tag) => {
          const found = getTag(tag, tags);
          if (found) {
            tMap.push(found);
          } else {
            // Either the tag or category was not found
            let category: string | undefined;
            let name: string | undefined;
            const catArr = tag.split(':');
            if (catArr.length > 1) {
              category = catArr[0].trim();
              name = catArr[1].trim();
            } else {
              category = '_uncategorized_';
              name = tag.trim();
            }

            // Do we have the category?
            const catIndex = tags.tagGroups.findIndex(
              (g) => g.category.toLowerCase() === category.toLowerCase()
            );
            if (catIndex === -1) {
              // Not found. Add new category
              tags.tagGroups.push({
                category: category,
                color:
                  category === '_uncategorized_'
                    ? '#A3A3A3'
                    : availableColors.length > 0
                    ? availableColors[0]
                    : '#0A0A0A',
              });

              availableColors.shift();
            }
            tags.tags.push({
              category: category,
              tag: name,
            });

            tagsUpdated = true;
            tMap.push({
              category,
              tag: name,
            });
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

  if (tagsUpdated) {
    await updateTags(tagsIn, tags, projectSlug);
  }

  return ret;
};

const updateTags = async (
  originalTags: Tags,
  newTags: Tags,
  projectSlug: string
) => {
  // First check for new tag groups
  for (let i = 0; i < newTags.tagGroups.length; i++) {
    const group = newTags.tagGroups[i];
    const found =
      originalTags.tagGroups.findIndex(
        (g) => g.category.toLowerCase() === group.category.toLowerCase()
      ) > -1;

    if (!found) {
      await fetch(`/api/projects/${projectSlug}/tag-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagGroup: group }),
      });
    }
  }

  // Now check for new tags
  for (let i = 0; i < newTags.tags.length; i++) {
    const tag = newTags.tags[i];
    const found =
      originalTags.tags.findIndex(
        (t) =>
          t.tag.toLowerCase() === tag.tag.toLowerCase() &&
          t.category.toLowerCase() === tag.category.toLowerCase()
      ) > -1;

    if (!found) {
      await fetch(`/api/projects/${projectSlug}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag: tag }),
      });
    }
  }
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
      const category = d[map['tag_category']]
        ? d[map['tag_category']].trim()
        : '_uncategorized_';
      if (!ret.tagGroups.find((g) => g.category === category)) {
        ret.tagGroups.push({
          category,
          color: tagColors[colorIndex++],
        });
      }
      ret.tags.push({
        tag: d[map['tag_name']].trim(),
        category,
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
