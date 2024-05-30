import { getUserOrgs, getUserMemberReposInOrg } from '@lib/GitHub/index.ts';
import { gitRepo } from './gitRepo.ts';
import type {
  UserInfo,
  GitHubOrganization,
  AllProjects,
  ProjectData,
} from '@ty/Types.ts';
import { initFs } from '@lib/memfs/index.ts';

export const getOrgs = async (
  userInfo: UserInfo
): Promise<GitHubOrganization[]> => {
  const orgs = await getUserOrgs(userInfo.token);

  return orgs.map((o) => ({
    orgName: o.login,
    url: o.url,
    description: o.description,
  }));
};

export const getProjects = async (userInfo: UserInfo): Promise<AllProjects> => {
  let repos: any[] = [];

  // Get the users orgs
  const myOrgs = await getUserOrgs(userInfo.token);

  // For each org, retrieve the repos and filter for the avannotate-project topic
  for (let i = 0; i < myOrgs.length; i++) {
    const myRepos = await getUserMemberReposInOrg(
      userInfo.token,
      myOrgs[i].login
    );
    repos = [
      ...repos,
      ...myRepos.filter((r) => r.topics.includes('avannotate-project')),
    ];
  }

  // For each project retrieve the project data
  const projects: ProjectData[] = [];
  for (let i = 0; i < repos.length; i++) {
    const fs = initFs();
    const { readFile } = await gitRepo({
      fs: fs,
      repositoryURL: repos[i].html_url,
      branch: 'main',
      userInfo: userInfo,
    });

    const proj = await readFile('/data/project.json');

    const project: ProjectData = JSON.parse(proj as string);

    project.users.push({
      loginName: userInfo.profile.gitHubName as string,
      avatarURL: userInfo.profile.avatarURL,
      admin: true,
    });

    projects.push(project);
  }

  return {
    myProjects: projects.filter(
      (p) => p.project.creator === userInfo.profile.gitHubName
    ),
    sharedProjects: projects.filter(
      (p) => p.project.creator !== userInfo.profile.gitHubName
    ),
  };
};
