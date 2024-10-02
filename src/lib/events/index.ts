import { emptyParagraph } from '@lib/slate/index.tsx';
import type { AnnotationEntry, FormEvent, Tag } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';

export const generateDefaultAnnotation = (): AnnotationEntry => ({
  uuid: uuidv4(),
  start_time: 0,
  end_time: 0,
  annotation: emptyParagraph,
  tags: [],
});

export const generateDefaultEvent = (): FormEvent => ({
  audiovisual_files: {
    [uuidv4()]: {
      label: '',
      is_offline: false,
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

export const fromTimestamp = (str: string): number => {
  const split = str.split(':').map((i) => parseInt(i));

  switch (split.length) {
    case 1:
      return split[0];
    case 2:
      return split[0] * 60 + split[1];
    case 3:
      return split[0] * 3600 + split[1] * 60 + split[2];
    case 4:
      return split[0] * 86400 + split[1] * 3600 + split[2] * 60 + split[3];
    default:
      return fromTimestamp(split.slice(-3).join(':'));
  }
};

// util function for testing tag equality
export const matchTag = (tag1: Tag, tag2: Tag) =>
  tag1.category.toLowerCase() === tag2.category.toLowerCase() &&
  tag1.tag === tag2.tag;

const fetchableFileTypes = ['mp3', 'mp4', 'ogg', 'm4a'];

export const getFileDuration = async (url: string): Promise<number | null> => {
  if (fetchableFileTypes.includes(url.slice(-3))) {
    // note: the Audio constructor can handle videos for this purpose too
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadeddata = () => {
        resolve(Math.floor(audio.duration));
      };
      audio.onerror = () => {
        resolve(null);
      };
      audio.src = url;
    });
  }

  return null;
};
