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

export type MediaPlayer = 'universal' | 'aviary';

export type Project = {
  title: string;
  description: string;
  language: string;
  slug: string;
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
  avatarURL: string;
  admin: boolean;
};

export type Projects = {
  projects: Project[];

  users: ProviderUser[];
};
