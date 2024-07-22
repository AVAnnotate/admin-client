import type {
  Event,
  MediaPlayer,
  FormEvent,
  FormPage,
  Page,
  Tags,
  ProviderUser,
} from '@ty/Types.ts';

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

export type apiProjectPut = {
  additional_users: ProviderUser[];
  authors: string,
  description: string,
  media_player: MediaPlayer;
  title: string,
}

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
