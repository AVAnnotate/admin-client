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
  is_private?: boolean;
  generate_pages_site?: boolean;
  title: string;
  description: string;
  language: string;
  slug: string;
  creator: string;
  authors: string;
  media_player: MediaPlayer;
  auto_populate_home_page: boolean;
  additional_users: ProviderUser[];
  tags: Tags;
  created_at: string;
  updated_at: string;
};

export type ProviderUser = {
  login_name: string;
  avatar_url?: string;
  admin: boolean;
  name?: string;
  not_accepted?: boolean;
};

export type Publish = {
  publish_pages_app: boolean;
  publish_sha: string;
  publish_iso_date: string;
};

export type CaptionSet = {
  annotation_page_id: string;
  speaker_category: string | undefined;
};

export type AudiovisualFile = {
  label: string;
  is_offline: boolean;
  file_type: 'Audio' | 'Video';
  file_url: string;
  duration: number;
  duration_overridden?: boolean;
  caption_set?: CaptionSet[];
};

// is_offline is stored as a string on the form
export type FormAudiovisualFile = Omit<AudiovisualFile, 'is_offline'> & {
  is_offline: 'true' | 'false' | boolean;
};

export type Event = {
  audiovisual_files: { [key: string]: AudiovisualFile };
  auto_generate_web_page: boolean;
  description: Node[];
  citation?: string;
  created_at: string;
  created_by: string;
  item_type?: 'Audio' | 'Video';
  label: string;
  updated_at: string;
  updated_by: string;
};

export type EventWithUUID = Event & {
  uuid: string;
};

export interface FormEvent
  extends Omit<
    Event,
    | 'created_at'
    | 'created_by'
    | 'updated_at'
    | 'updated_by'
    | 'audiovisual_files'
  > {
  audiovisual_files: { [key: string]: FormAudiovisualFile };
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export type AutoGenerate = {
  enabled: boolean;
  type: string;
  type_id?: string;
};

export type Page = {
  content: Node[];
  created_at: string;
  created_by: string;
  title: string;
  slug?: string;
  parent?: string;
  updated_at: string;
  updated_by: string;
  autogenerate: AutoGenerate;
};

export interface FormPage
  extends Omit<
    Page,
    'created_at' | 'created_by' | 'updated_at' | 'updated_by'
  > {
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export type ProjectFile = {
  project: Project;

  users: ProviderUser[];

  publish: Publish;

  repo_created_at: string;
  repo_updated_at: string;
};

export type ProjectData = {
  annotations: { [key: string]: Annotation };

  events: { [key: string]: Event };
  eventOrder?: string[];

  pages: { [key: string]: Page };
  pageOrder?: string[];
} & ProjectFile;

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
  uuid: string;
  start_time: number;
  end_time: number;
  annotation: Node[];
  tags: Tag[];
};

export type Annotation = {
  event_id: string;
  source_id: string;
  set: string;
  annotations: AnnotationEntry[];
};

export type DropdownOption = {
  label: string;
  required?: boolean;
  value: string;
};

export type AnnotationPage = {
  event_id: string;
  source_id: string;
  set: string;
  annotations: AnnotationEntry[];
};

export type AnnotationCounts = { [key: string]: { [key: string]: number } };
