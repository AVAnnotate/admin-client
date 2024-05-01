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

export type Project = {
  title: string;
  description: string;
  language: string;
  slug: string;
  authors: string[];
  mediaPlayer: 'universal' | 'aviary';
  autoPopulateHomePage: boolean;
  users: string[];
};
