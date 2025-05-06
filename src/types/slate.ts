import type { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

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

export type ColumnLayout = [6] | [2, 4] | [3, 3] | [4, 2];

export type ImageSize = 'thumbnail' | 'medium' | 'large' | 'full';

export interface ImageData {
  url: string;
  size?: ImageSize;
  caption?: string;
}

export type Includes = 'media' | 'annotations' | 'label' | 'description';

export interface SlateEventNodeData {
  end?: number;
  file?: string;
  includes: Includes[];
  start?: number;
  uuid: string;
  type?: string;
}

export interface SlateCompareEventData {
  event1: Omit<SlateEventNodeData, 'includes'>;
  event2: Omit<SlateEventNodeData, 'includes'>;
  includes: Includes[];
}

export type AVAEditor = BaseEditor & ReactEditor & HistoryEditor;
