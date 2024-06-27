import {
  getUserOrgs,
  getUserMemberReposInOrg,
  getUserMemberRepos,
  getCollaborators,
} from '@lib/GitHub/index.ts';
import { gitRepo } from './gitRepo.ts';
import type {
  UserInfo,
  GitHubOrganization,
  AllProjects,
  ProjectData,
  Event,
  Page,
} from '@ty/Types.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { IFs } from 'memfs';

export const getOrgs = async (
  userInfo: UserInfo
): Promise<GitHubOrganization[]> => {
  const orgs = await getUserOrgs(userInfo.token);

  orgs.unshift({
    login: userInfo.profile.gitHubName,
    url: `https://https://github.com/${userInfo.profile.gitHubName}`,
    description: '',
  });

  return orgs.map((o) => ({
    orgName: o.login,
    url: o.url,
    description: o.description,
  }));
};

export const getRepos = async (userInfo: UserInfo): Promise<any> => {
  let repos: any[] = [];

  // Get the user's repos
  const myRepos = await getUserMemberRepos(
    userInfo.token,
    userInfo.profile.gitHubName as string
  );

  repos = myRepos.filter((r) => r.topics.includes('avannotate-project'));

  // Get the users orgs
  const myOrgs = await getUserOrgs(userInfo.token);

  myOrgs.unshift({ orgName: userInfo.profile.gitHubName });

  // For each org, retrieve the repos and filter for the avannotate-project topic
  for await (const org of myOrgs) {
    const myRepos = await getUserMemberReposInOrg(userInfo.token, org.login);
    repos = [
      ...repos,
      ...myRepos.filter((r) => r.topics.includes('avannotate-project')),
    ];
  }

  return repos;
};

const getDirData = (fs: IFs, filenames: string[], dir: string) => {
  const data: { [key: string]: any } = {};

  for (const filename of filenames) {
    try {
      const contents = fs.readFileSync(`/data/${dir}/${filename}`);
      data[filename.replace('.json', '')] = JSON.parse(contents as string);
    } catch (e: any) {
      console.warn(`Error fetching data for event ${filename}: ${e.message}`);
    }
  }

  return data;
};

const getPageData = (fs: IFs, topLevelNames: string[], dir: string) => {
  const pages: { [key: string]: Page } = {};

  // Fill two separate arrays depending on whether a
  // page is a child or a parent.
  for (const filename of topLevelNames) {
    if (filename !== 'manifest.json') {
      const contents: Page = JSON.parse(
        fs.readFileSync(`/data/${dir}/${filename}`) as string
      );

      pages[filename.replace('.json', '')] = contents;
    }
  }

  let manifest: string[] = [];

  if (fs.existsSync(`/data/${dir}/manifest.json`)) {
    const manifestFile = fs.readFileSync(`/data/${dir}/manifest.json`);
    manifest = JSON.parse(manifestFile as string);
  }

  return { pages, manifest };
};

export const getProject = async (userInfo: UserInfo, htmlUrl: string) => {
  const fs = initFs();

  const { exists, readDir, readFile } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  const project: ProjectData = JSON.parse(proj as string);

  project.users.push({
    loginName: userInfo.profile.gitHubName as string,
    avatarURL: userInfo.profile.avatarURL,
    admin: true,
  });

  const eventFiles = exists('/data/events') ? readDir('/data/events') : [];
  const pageFiles = exists('/data/pages') ? readDir('/data/pages') : [];

  project.events = getDirData(fs, eventFiles as unknown as string[], 'events');

  const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

  project.pages = pageData.pages;
  project.pagesManifest = pageData.manifest;

  return project;
};

export const getProjects = async (userInfo: UserInfo): Promise<AllProjects> => {
  const repos = await getRepos(userInfo);

  // For each project retrieve the project data
  const projects: ProjectData[] = [];
  for await (const repo of repos) {
    const projectData = await getProject(userInfo, repo.html_url);

    const users = await getCollaborators(
      repo.name,
      repo.owner.login,
      userInfo.token
    );

    if (users.ok) {
      const userData: any[] = await users.json();
      const collabs = userData.filter((u) =>
        ['write', 'maintain', 'admin'].includes(u.role_name)
      );
      projectData.users = collabs.map((u: any) => {
        return {
          loginName: u.login,
          avatarURL: u.avatar_url,
          admin: u.site_admin,
        };
      });
    }

    projects.push(projectData);
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

export const parseSlug = (slug: string) => {
  const split = slug.split(/\+(.*)/s);
  const org = split[0];
  const repo = split[1];

  return {
    org,
    repo,
  };
};

export const getRepositoryUrl = (projectSlug: string) => {
  const { org, repo } = parseSlug(projectSlug);
  return `https://github.com/${org}/${repo}`;
};
