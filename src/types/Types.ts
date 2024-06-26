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
  tagGroupValue: string;
  value: string;
};

export type TagGroup = {
  value: string;
  color: string;
};

export type Tags = {
  tagGroups: TagGroup[];
  tags: Tag[];
};

export type MediaPlayer = 'avannotate' | 'universal' | 'aviary';

export type Project = {
  gitHubOrg: string;
  title: string;
  description: string;
  language: string;
  slug: string;
  creator: string;
  authors: string;
  mediaPlayer: MediaPlayer;
  autoPopulateHomePage: boolean;
  additionalUsers: ProviderUser[];
  tags?: Tags;
  createdAt: string;
  updatedAt: string;
};

export type ProviderUser = {
  loginName: string;
  avatarURL?: string;
  admin: boolean;
  name?: string;
};

export type Publish = {
  publishPagesApp: boolean;
  publishSHA: string;
  publishISODate: string;
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

export type ProjectData = {
  events: { [key: string]: Event };

  pages: { [key: string]: Page };

  project: Project;

  users: ProviderUser[];

  publish: Publish;
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
