import type {
  Event,
  MediaPlayer,
  FormEvent,
  FormPage,
  Page,
  Tags,
  ProviderUser,
  TagGroup,
  Tag,
  AnnotationEntry,
} from '@ty/Types.ts';
import type { Node } from 'slate';

export type apiAnnotationPost = Omit<AnnotationEntry, 'uuid'>;

export type apiAnnotationPut = Omit<AnnotationEntry, 'uuid'>;

export type apiProjectsProjectNamePost = {
  templateRepo: string;
  description: string;
  visibility?: 'private' | 'public'; // Defaults to private
  title: string;
  slug: string;
  gitHubOrg: string;
  projectDescription: string;
  projectAuthors: string;
  mediaPlayer: MediaPlayer;
  additionalUsers: string[];
  language: string;
  autoPopulateHomePage: boolean;
  tags?: Tags;
};

export type apiEventPut = {
  event: Event | FormEvent;
};

export type apiEventsPost = {
  event?: FormEvent;
  events?: FormEvent[];
};

export type apiPageOrderPost = {
  order: string[];
};

export type apiPagePost = {
  page?: FormPage;
  pages?: FormPage[];
};

export type apiPagePut = {
  page: Page;
};

export type apiAddTagGroup = {
  tagGroup: TagGroup;
};

export type apiDeleteTagGroup = {
  tagGroup: TagGroup;
};

export type apiAddTag = {
  tag: Tag;
};

export type apiUpdateTag = {
  oldTag: Tag;
  newTag: Tag;
};

export type apiDeleteTag = {
  tag: Tag;
};

export type apiProjectPut = {
  additional_users: ProviderUser[];
  authors: string;
  description: string;
  media_player: MediaPlayer;
  title: string;
};

export type apiAnalyzeManifest = {
  manifest_url: string;
};

export type apiImportManifest = {
  manifest_url: string;
  description: Node[];
  auto_generate_web_page: boolean;
  event_labels?: string[];
};
