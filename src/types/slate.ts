// TypeScript users only add this code
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

export type InsertButtonModalTypes = 'single-event' | 'event-compare';

export type ColumnLayout = [2, 4] | [3, 3] | [4, 2];

export type Includes = 'media' | 'annotations' | 'label' | 'description'

export interface SlateEventNodeData {
  uuid: string,
  includes: Includes[],
  start?: number,
  end?: number
}

export interface SlateCompareEventData {
  includes: Includes[],
  event1: Omit<SlateEventNodeData, 'includes'>,
  event2: Omit<SlateEventNodeData, 'includes'>,
}