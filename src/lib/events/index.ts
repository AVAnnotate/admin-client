import type { FormEvent } from '@ty/Types.ts';
import { v4 as uuidv4 } from 'uuid';

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
