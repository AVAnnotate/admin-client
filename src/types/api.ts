import type {
  Event,
  MediaPlayer,
  NewEvent,
  NewPage,
  Page,
  Tags,
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

export type apiEventPut = {
  event: Event | NewEvent;
};

export type apiEventsPost = {
  event?: NewEvent;
  events?: NewEvent[];
};

export type apiPageOrderPost = {
  order: string[];
};

export type apiPagePost = {
  page?: NewPage;
  pages?: NewPage[];
};

export type apiPagePut = {
  page: Page;
};
