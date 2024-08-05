import { emptyParagraph } from '@lib/slate/index.tsx';
import type { AnnotationEntry, FormEvent } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';

export const generateDefaultAnnotation = (): AnnotationEntry => ({
  uuid: uuidv4(),
  start_time: 0,
  end_time: 0,
  annotation: emptyParagraph,
  tags: []
})

export const generateDefaultEvent = (): FormEvent => ({
  audiovisual_files: {
    [uuidv4()]: {
      label: '',
      file_url: '',
      duration: 90,
    },
  },
  auto_generate_web_page: true,
  description: [
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
  citation: '',
  item_type: 'Audio',
  label: '',
});

export const formatTimestamp = (seconds: number, includeMs = true) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  let ms;

  let str = `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;

  if (includeMs) {
    ms = date.getUTCMilliseconds().toString().padStart(3, '0');
    str = `${str}:${ms}`;
  }

  return str;
};
