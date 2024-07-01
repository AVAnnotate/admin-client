import type { Node } from 'slate';

export interface Translations {
  lang: string;

  t: { [key: string]: string };
}

export interface UserProfile {
  gitHubName?: string;

  name: string;

  avatarURL?: string;
}

export type MyProfile = UserProfile & {
  email?: string;
};

export type UserInfo = {
  profile: MyProfile;
  token: string;
};

export type Tag = {
  category: string;
  tag: string;
};

export type TagGroup = {
  category: string;
  color: string;
};

export type Tags = {
  tagGroups: TagGroup[];
  tags: Tag[];
};

export type MediaPlayer = 'avannotate' | 'universal' | 'aviary';

export type Project = {
  github_org: string;
  title: string;
  description: string;
  language: string;
  slug: string;
  creator: string;
  authors: string;
  media_player: MediaPlayer;
  auto_populate_home_page: boolean;
  additional_users: ProviderUser[];
  tags?: Tags;
  created_at: string;
  updated_at: string;
};

export type ProviderUser = {
  loginName: string;
  avatarURL?: string;
  admin: boolean;
  name?: string;
};

export type Publish = {
  publish_pages_app: boolean;
  publish_sha: string;
  publish_iso_date: string;
};

export type Event = {
  audiovisual_files: {
    label: string;
    file_url: string;
    duration: number;
  }[];
  auto_generate_web_page: boolean;
  description: Node[];
  citation?: string;
  created_at: string;
  created_by: string;
  item_type: 'Audio' | 'Video';
  label: string;
  updated_at: string;
  updated_by: string;
};

export interface NewEvent
  extends Omit<
    Event,
    'created_at' | 'created_by' | 'updated_at' | 'updated_by'
  > {
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export type Page = {
  content: Node[];
  created_at: string;
  created_by: string;
  title: string;
  order: number;
  parent?: string;
  updated_at: string;
  updated_by: string;
};

export interface NewPage
  extends Omit<
    Page,
    'created_at' | 'created_by' | 'updated_at' | 'updated_by'
  > {
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export type ProjectData = {
  events: { [key: string]: Event };

  pages: { [key: string]: Page };
  pageOrder: string[];

  project: Project;

  users: ProviderUser[];

  publish: Publish;

  events?: any[];
};

export type AllProjects = {
  myProjects: ProjectData[];
  sharedProjects: ProjectData[];
};

export type GitHubOrganization = {
  orgName: string;
  url: string;
  description: string;
};

export type ParseAnnotationResults = {
  headers: string[];
  data: any[];
  rowCount: number;
};

export type AnnotationEntry = {
  start_time: number;
  end_time: number;
  annotation: string;
  tags: string[];
};

export type DropdownOption = {
  label: string;
  required?: boolean;
  value: string;
};
