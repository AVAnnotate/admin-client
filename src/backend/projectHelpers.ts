import {
  getUserOrgs,
  getUserMemberReposInOrg,
  getUserMemberRepos,
  getCollaborators,
  addCollaborator,
  getUser,
} from '@lib/GitHub/index.ts';
import { gitRepo, type GitRepoContext } from './gitRepo.ts';
import type {
  UserInfo,
  GitHubOrganization,
  AllProjects,
  ProjectData,
  Page,
  ProviderUser,
} from '@ty/Types.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { IFs } from 'memfs';
import type { RepositoryInvitation } from '@ty/github.ts';

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
    const reps = await getUserMemberReposInOrg(userInfo.token, org.login);

    repos = repos.concat(
      reps.filter((r) => {
        return r.topics.includes('avannotate-project');
      })
    );
    // repos = [
    //   ...repos,
    //   ...reps.filter((r) => r.topics.includes('avannotate-project')),
    // ];
  }

  return repos;
};

export const getDirData = (fs: IFs, filenames: string[], dir: string) => {
  const data: { [key: string]: any } = {};

  for (const filename of filenames) {
    if (filename !== 'order.json' && filename !== '.gitkeep') {
      try {
        const contents = fs.readFileSync(`/data/${dir}/${filename}`);
        data[filename.replace('.json', '')] = JSON.parse(contents as string);
      } catch (e: any) {
        console.warn(`Error fetching data for event ${filename}: ${e.message}`);
      }
    }
  }

  return data;
};

export const getPageData = (fs: IFs, topLevelNames: string[], dir: string) => {
  const pages: { [key: string]: Page } = {};

  // Fill two separate arrays depending on whether a
  // page is a child or a parent.
  for (const filename of topLevelNames) {
    if (filename !== 'order.json' && filename !== '.gitkeep') {
      const file = fs.readFileSync(`/data/${dir}/${filename}`);

      try {
        const contents: Page = JSON.parse(file.toString());
        pages[filename.replace('.json', '')] = contents;
      } catch (e) {
        console.warn(`Error parsing ${filename}: ${e}`);
      }
    }
  }

  let order: string[] = [];

  if (fs.existsSync(`/data/${dir}/order.json`)) {
    const orderFile = fs.readFileSync(`/data/${dir}/order.json`);
    order = JSON.parse(orderFile as string);
  }

  return { pages, order };
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
    login_name: userInfo.profile.gitHubName as string,
    avatar_url: userInfo.profile.avatarURL,
    admin: true,
  });

  const eventFiles = exists('/data/events')
    ? readDir('/data/events', '.json')
    : [];
  const pageFiles = exists('/data/pages')
    ? readDir('/data/pages', '.json')
    : [];

  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations')
    : [];

  project.annotations = getDirData(fs, annotationFiles as unknown as string[], 'annotations')
  project.events = getDirData(fs, eventFiles as unknown as string[], 'events');

  project.annotations = getDirData(
    fs,
    annotationFiles as unknown as string[],
    'annotations'
  );

  const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

  project.pages = pageData.pages;
  project.pageOrder = pageData.order;

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
          login_name: u.login,
          avatar_url: u.avatar_url,
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

export const buildProjectData = (
  project: ProjectData,
  context: GitRepoContext
) => {
  const { exists, readDir, options } = context;

  const eventFiles = exists('/data/events')
    ? readDir('/data/events', '.json')
    : [];
  const pageFiles = exists('/data/pages')
    ? readDir('/data/pages', '.json')
    : [];
  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations', '.json')
    : [];

  project.events = getDirData(
    options.fs,
    eventFiles as unknown as string[],
    'events'
  );

  project.annotations = getDirData(
    options.fs,
    annotationFiles as unknown as string[],
    'annotations'
  );

  const pageData = getPageData(
    options.fs,
    pageFiles as unknown as string[],
    'pages'
  );

  project.pages = pageData.pages;
  project.pageOrder = pageData.order;

  return project;
};

export const addCollaborators = async (
  additionalUsers: string[],
  projectName: string,
  org: string,
  token: any
) => {
  const collabs: ProviderUser[] = [];
  for (let i = 0; i < additionalUsers.length; i++) {
    const respCollabs: Response = await addCollaborator(
      projectName as string,
      org,
      additionalUsers[i],
      token?.value as string
    );

    if (!respCollabs.ok) {
      throw new Error(`Failed to add collaborator ${additionalUsers[i]}`);
    }

    if (respCollabs.status == 204) {
      // Must be a team member
      const userResp = await getUser(
        token?.value as string,
        additionalUsers[i]
      );

      if (!userResp.ok) {
        console.error(`Failed to find collaborator ${additionalUsers[i]}`);
      } else {
        const data = await userResp.json();

        collabs.push({
          login_name: data.login,
          avatar_url: data.avatar_url,
          admin: false,
        });
      }
    } else {
      const data: RepositoryInvitation = await respCollabs.json();

      collabs.push({
        login_name: data.invitee!.login,
        avatar_url: data.invitee!.avatar_url,
        admin: data.permissions === 'admin',
      });
    }
  }
  console.log('Collaborators created');
  return collabs;
};
