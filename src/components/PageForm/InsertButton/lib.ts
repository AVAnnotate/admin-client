import type { ProjectData, Translations } from "@ty/Types.ts";

export interface InsertModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (event: { [key: string]: any }) => void;
}

export type InsertButtonModalTypes = 'single-event' | 'event-compare';

export type ColumnLayout = [2, 4] | [3, 3] | [4, 2];