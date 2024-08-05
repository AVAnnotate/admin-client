import type { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

type CustomElement = { type: 'paragraph'; children: CustomText[] };
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export type ElementTypes = 'marks' | 'blocks' | 'images';

export type InsertButtonModalTypes = 'single-event' | 'event-compare';

export type ColumnLayout = [2, 4] | [3, 3] | [4, 2];

export type ImageSize = 'thumbnail' | 'medium' | 'large' | 'full';

export interface ImageData {
  url: string;
  size: ImageSize;
}

export type Includes = 'media' | 'annotations' | 'label' | 'description';

export interface SlateEventNodeData {
  end?: number;
  file: string;
  includes: Includes[];
  start?: number;
  uuid: string;
}

export interface SlateCompareEventData {
  event1: Omit<SlateEventNodeData, 'includes'>;
  event2: Omit<SlateEventNodeData, 'includes'>;
  includes: Includes[];
}
