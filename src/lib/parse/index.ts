import type {
  AnnotationEntry,
  FormEvent,
  ParseAnnotationResults,
} from '@ty/Types.ts';
import { read, utils } from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export const parseSpreadsheetData = async (
  data: File,
  hasColumnHeaders: boolean
): Promise<ParseAnnotationResults> => {
  const workbook = read(await data.arrayBuffer(), { type: 'array' });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  const annotations: any[] = utils.sheet_to_json(firstSheet, { header: 1 });

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

export const mapAnnotationData = (
  data: any[],
  map: { [key: string]: number }
): AnnotationEntry[] => {
  const ret: AnnotationEntry[] = [];

  data.forEach((d) => {
    ret.push({
      start_time: d[map['start_time']],
      end_time: d[map['end_time']],
      annotation: d[map['annotation']],
      tags: d[map['tags']],
    });
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
