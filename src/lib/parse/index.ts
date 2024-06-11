import type { AnnotationEntry, ParseAnnotationResults } from '@ty/Types.ts';
import { read, utils } from 'xlsx';

export const parseAnnotationData = async (
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
