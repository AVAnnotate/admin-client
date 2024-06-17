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
  description: string;
  citation?: string;
  created_at: string;
  created_by: string;
  item_type: 'Audio';
  label: string;
  updated_at: string;
  updated_by: string;
  uuid: string;
};

export type ProjectData = {
  events: Event[];

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
