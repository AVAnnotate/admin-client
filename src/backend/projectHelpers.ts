import {
  getUserOrgs,
  getCollaborators,
  getInvitedCollaborators,
  addCollaborator,
  getUser,
  removeCollaborator,
  getUserRepos,
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
  const myRepos = await getUserRepos(userInfo.token);

  repos = myRepos.filter((r) => r.topics.includes('avannotate-project'));

  // Get the users orgs
  const myOrgs = await getUserOrgs(userInfo.token);

  myOrgs.unshift({ orgName: userInfo.profile.gitHubName });

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

  const users = await getCollaborators(
    project.project.slug,
    project.project.github_org,
    userInfo.token
  );

  if (users.ok) {
    const userData: any[] = await users.json();
    const collabs = userData.filter((u) =>
      ['write', 'maintain', 'admin'].includes(u.role_name)
    );

    project.users = collabs.map((u: any) => {
      return {
        login_name: u.login,
        avatar_url: u.avatar_url,
        admin: u.role_name === 'admin',
      };
    });
  }

  const invites = await getInvitedCollaborators(
    project.project.slug,
    project.project.github_org,
    userInfo.token
  );

  if (invites.ok) {
    const invitesData: any[] = await invites.json();

    project.users = [
      ...project.users,
      ...invitesData.map((i: any) => {
        return {
          login_name: i.invitee.login,
          avatar_url: i.invitee.avatar_url,
          admin: false,
          not_accepted: true,
        };
      }),
    ];
  }

  const eventFiles = exists('/data/events')
    ? readDir('/data/events', '.json')
    : [];
  const pageFiles = exists('/data/pages')
    ? readDir('/data/pages', '.json')
    : [];

  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations')
    : [];

  project.annotations = getDirData(
    fs,
    annotationFiles as unknown as string[],
    'annotations'
  );
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
  const users = await getCollaborators(projectName, org, token);

  let currentUsers: ProviderUser[] = [];

  if (users.ok) {
    const userData: any[] = await users.json();
    const collabs = userData.filter((u) =>
      ['write', 'maintain', 'admin'].includes(u.role_name)
    );

    if (collabs.length > 0) {
      currentUsers = collabs.map((u: any) => {
        return {
          login_name: u.login,
          avatar_url: u.avatar_url,
          admin: u.role_name === 'admin',
        };
      });
    }
  }

  const invites = await getInvitedCollaborators(projectName, org, token);

  if (invites.ok) {
    const inviteData = await invites.json();

    currentUsers = [
      ...currentUsers,
      ...inviteData.map((i: any) => {
        return {
          login_name: i.invitee.login,
          avatar_url: i.invitee.avatar_url,
          admin: i.invitee.site_admin,
          not_accepted: true,
        };
      }),
    ];
  }

  // Look for new users to add
  for (let i = 0; i < additionalUsers.length; i++) {
    const findIdx = currentUsers.findIndex((u) => {
      return u.login_name === additionalUsers[i];
    });

    if (findIdx === -1) {
      console.log('Did not find user, adding: ', additionalUsers[i]);
      const respCollabs: Response = await addCollaborator(
        projectName as string,
        org,
        additionalUsers[i],
        token as string
      );

      if (!respCollabs.ok) {
        throw new Error(`Failed to add collaborator ${additionalUsers[i]}`);
      }

      if (respCollabs.status == 204) {
        // Must be a team member
        const userResp = await getUser(token as string, additionalUsers[i]);

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
  }

  // Now see if there are users to remove
  for (let i = 0; i < currentUsers.length; i++) {
    const findIdx = additionalUsers.findIndex(
      (u) => u === currentUsers[i].login_name
    );

    if (findIdx === -1 && !currentUsers[i].admin) {
      console.log('Here!');
      const respCollabs: Response = await removeCollaborator(
        projectName as string,
        org,
        currentUsers[i].login_name,
        token as string
      );

      console.log('!done');

      if (!respCollabs.ok) {
        throw new Error(`Failed to remove collaborator ${additionalUsers[i]}`);
      }
    }
  }
  console.log('Collaborators updated');
  return collabs;
};
