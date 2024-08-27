import type { AnnotationEntry, Tag } from '@ty/Types.ts';
// @ts-ignore
import VTT from 'webvtt-parser';
import { v4 as uuidv4 } from 'uuid';
import { Node } from 'slate';

export const formatTimestamp = (seconds: number, includeMs = true) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  let ms;

  let str = `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;

  if (includeMs) {
    ms = date.getUTCMilliseconds().toString().padStart(3, '0');
    str = `${str}.${ms}`;
  }

  return str;
};

export const vttToAnnotations = (
  vttFile: string,
  voiceCategory: string | undefined
): AnnotationEntry[] => {
  const parser = new VTT.WebVTTParser();

  const tree = parser.parse(vttFile, 'captions');

  let ret: AnnotationEntry[] = [];
  tree.cues.forEach((cue: any) => {
    const p = parseCue(cue.text, voiceCategory);
    ret.push({
      uuid: uuidv4(),
      start_time: cue.startTime,
      end_time: cue.endTime,
      annotation: p.text,
      tags: p.tags,
    });
  });

  return ret;
};

type ParseCueResponse = {
  text: Node[];
  tags: Tag[];
};
const parseCue = (text: string, voiceCategory: string | undefined) => {
  let ret: ParseCueResponse = {
    text: [{ type: 'paragraph', children: [] }],
    tags: [],
  };

  let spl1 = text.match(/\<(.*?)\>/g);

  let textOut = text;
  if (spl1) {
    spl1.forEach((sp) => {
      textOut = textOut.replace(sp, '');

      const spanTypeArr1 = sp.split('<');
      const spanTypeArr2 = spanTypeArr1[1].split('>');
      const spanTypeArr = spanTypeArr2[0].split(' ');

      let spanType;
      // For now we will just handle voice
      if (spanTypeArr.length > 0) {
        if (spanTypeArr[0] === 'c') {
          spanType = 'class';
        } else if (spanTypeArr[0] === 'i') {
          spanType = 'italics';
        } else if (spanTypeArr[0] === 'b') {
          spanType = 'bold';
        } else if (spanTypeArr[0] === 'u') {
          spanType = 'underline';
        } else if (spanTypeArr[0] === 'ruby') {
          spanType = 'ruby';
        } else if (spanTypeArr[0] === 'v') {
          spanType = 'voice';
        } else if (spanTypeArr[0] === 'lang') {
          spanType = 'lang';
        }
      }

      if (spanType === 'voice') {
        // Add a tag
        ret.tags.push({
          category: voiceCategory || '_uncategorized_',
          tag: spanTypeArr.splice(1).join(' '),
        });
      }
    });
    // @ts-ignore
    ret.text[0].children.push({ text: textOut });
  } else {
    // @ts-ignore
    ret.text[0].children.push({ text: text });
  }

  return ret;
};

export const annotationsToVtt = (
  annos: AnnotationEntry[],
  voiceTagCategory: string
) => {
  let ret: string = 'WEBVTT\n\n';

  annos.forEach((a) => {
    const tag = a.tags.find((t) => t.category === voiceTagCategory);
    ret += `${formatTimestamp(a.start_time)} --> ${formatTimestamp(
      a.end_time
    )}\n`;
    ret += tag
      ? `<v ${tag.tag}>${a.annotation.map((n) => Node.string(n)).join('')}\n\n`
      : `${a.annotation.map((n) => Node.string(n)).join('')}\n\n`;
  });

  return ret;
};
