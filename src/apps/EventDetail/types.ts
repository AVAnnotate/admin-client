import type {
  Annotation,
  AnnotationEntry,
  Event,
  Translations,
  ProjectData,
} from '@ty/Types.ts';

export interface EventDisplayProps {
  allAnnotations: {
    [k: string]: Annotation;
  };
  avFileUuid: string;
  displayAnnotations: AnnotationEntry[];
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
  sets: {
    uuid: string;
    label: string;
  }[];
  setUuid: string | null;
  stateHandlers: {
    setAvFile: (uuid: string) => void;
    setCurrentSetUuid: (uuid: string) => void;
    setDeleteAnnoUuid: (uuid: string) => void;
    setEditAnnoUuid: (uuid: string) => void;
    setShowAddSetModal: (arg: boolean) => void;
    setShowEventDeleteModal: (arg: boolean) => void;
    setShowAnnoCreateModal: (arg: boolean) => void;
    setSearch: (q: string) => void;
  };
  sortAnnotations: (annos: AnnotationEntry[]) => AnnotationEntry[];
  searchAnnotations: (
    annos: AnnotationEntry[],
    search: string
  ) => AnnotationEntry[];
}
