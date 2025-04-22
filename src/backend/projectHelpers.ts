import {
  getUserOrgs,
  getCollaborators,
  getInvitedCollaborators,
  addCollaborator,
  getUser,
  removeCollaborator,
  getUserRepos,
  getRepo,
  getWorkflowInfo,
  getWorkflowContent,
  updateWorkflowContent,
  triggerWorkflow,
} from '@lib/GitHub/index.ts';
import { gitRepo, type GitRepoContext } from './gitRepo.ts';
import type {
  UserInfo,
  GitHubOrganization,
  AllProjects,
  ProjectData,
  Page,
  Event,
  ProviderUser,
} from '@ty/Types.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { IFs } from 'memfs';
import type { RepositoryInvitation } from '@ty/github.ts';
import type { apiPublishSite } from '@ty/api.ts';

export const parseURL = (url: string) => {
  const splitStart = url.split('https://github.com/');
  const split = splitStart[1].split('/');
  const org = split[0];
  const repo = split[1];

  return {
    org,
    repo,
  };
};

const TEMPLATE_BRANCH = import.meta.env.OVERRIDE_TEMPLATE_BRANCH || 'main';

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

export const getEventData = (
  context: GitRepoContext,
  topLevelNames: string[],
  dir: string
) => {
  const events: { [key: string]: Event } = {};

  // Fill two separate arrays depending on whether a
  // page is a child or a parent.
  for (const filename of topLevelNames) {
    if (filename !== 'order.json' && filename !== '.gitkeep') {
      const file = context.readFile(`/data/${dir}/${filename}`);

      try {
        const contents: Event = JSON.parse(file.toString());
        events[filename.replace('.json', '')] = contents;
      } catch (e) {
        console.warn(`Error parsing ${filename}: ${e}`);
      }
    }
  }

  let order: string[] = [];

  if (context.exists(`/data/${dir}/order.json`)) {
    console.log('Here!');
    const orderFile = context.readFile(`/data/${dir}/order.json`);
    order = JSON.parse(orderFile as string);
  } else {
    Object.keys(events).forEach((k) => order.push(k));
  }

  return { events, order };
};

export const getProject = async (
  userInfo: UserInfo,
  htmlUrl: string,
  skipDataFiles?: boolean
) => {
  const fs = initFs();

  const { exists, readDir, readFile, writeFile, commitAndPush, context } =
    await gitRepo({
      fs: fs,
      repositoryURL: htmlUrl,
      branch: 'main',
      userInfo: userInfo,
    });

  const proj = readFile('/data/project.json');

  const project: ProjectData = JSON.parse(proj as string);

  const parsed = parseURL(htmlUrl);

  const respRepo = await getRepo(
    userInfo.token,
    parsed.org,
    project.project.slug
  );

  const repo = await respRepo.json();

  let projectChanged = false;

  // Make sure the project file is accurate
  if (project.project.github_org !== parsed.org) {
    project.project.github_org = parsed.org;
    projectChanged = true;
  }

  if (project.project.is_private !== repo.private) {
    project.project.is_private = repo.private;
    projectChanged = true;
  }

  if (project.project.generate_pages_site !== repo.has_pages) {
    project.project.generate_pages_site = repo.has_pages;
    projectChanged = true;
  }

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

  if (!skipDataFiles) {
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
    const eventData = getEventData(
      context,
      eventFiles as unknown as string[],
      'events'
    );

    project.events = eventData.events;
    project.eventOrder = eventData.order;

    project.annotations = getDirData(
      fs,
      annotationFiles as unknown as string[],
      'annotations'
    );

    const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

    project.pages = pageData.pages;
    project.pageOrder = pageData.order;
  }

  if (projectChanged) {
    const success = await writeFile(
      '/data/project.json',
      JSON.stringify(project, null, 2)
    );

    if (!success) {
      console.error('Failed to write project data');
      return project;
    }

    const successCommit = await commitAndPush(
      `Updated project file for ${project.project.title}`
    );

    if (successCommit.error) {
      console.error('Failed to write project data: ', successCommit.error);
      return project;
    }
  }

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

  const eventData = getEventData(
    context,
    eventFiles as unknown as string[],
    'events'
  );

  project.events = eventData.events;
  project.eventOrder = eventData.order;

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
      const respCollabs: Response = await removeCollaborator(
        projectName as string,
        org,
        currentUsers[i].login_name,
        token as string
      );

      if (!respCollabs.ok) {
        throw new Error(`Failed to remove collaborator ${additionalUsers[i]}`);
      }
    }
  }
  console.log('Collaborators updated');
  return collabs;
};

export const publishSite = async (
  userInfo: UserInfo,
  org: string,
  repo: string,
  projectName: string,
  options: apiPublishSite
) => {
  // First make sure the workflow is current

  // Get the SHA of the template repo
  const resultBase = await getWorkflowInfo(
    userInfo.token,
    'avannotate',
    'project-template',
    'deploy-main.yml',
    TEMPLATE_BRANCH
  );

  if (!resultBase.ok) {
    console.log(
      'Failed to get template repo workflow info: ',
      resultBase.statusText
    );
    return false;
  }

  const base = await resultBase.json();
  const baseSHA = base.sha;

  // Get the SHA of the current project workflow
  const resultCurrent = await getWorkflowInfo(
    userInfo.token,
    org,
    repo,
    'deploy-main.yml'
  );

  if (!resultCurrent.ok) {
    console.log(
      'Failed to get target repo workflow info: ',
      resultCurrent.statusText
    );
    return false;
  }

  const current = await resultCurrent.json();
  const repoSHA = current.sha;

  if (baseSHA !== repoSHA) {
    // Fetch the newest
    const resultGet = await getWorkflowContent(
      userInfo.token,
      'avannotate',
      'project-template',
      'deploy-main.yml',
      TEMPLATE_BRANCH
    );

    if (!resultGet.ok) {
      console.log(
        'Failed to get template repo workflow content: ',
        resultGet.statusText
      );
      return;
    }

    const workflow = await resultGet.text();

    // Update the current workflow
    const resultPut = await updateWorkflowContent(
      userInfo.token,
      org,
      repo,
      'deploy-main.yml',
      workflow,
      repoSHA
    );

    if (!resultPut.ok) {
      console.log('Failed to update workflow: ', resultPut.statusText);
      return false;
    }
  }

  // Update the project file
  const repositoryURL = getRepositoryUrl(projectName);

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: initFs(),
    repositoryURL,
    userInfo: userInfo,
  });

  const projectData = readFile('/data/project.json');
  const project: ProjectData = JSON.parse(projectData as string);

  project.publish.publish_pages_app = !!options.publish_pages;
  project.publish.publish_static_site = !!options.publish_static;

  const res = await writeFile('/data/project.json', JSON.stringify(project));

  if (!res) {
    console.log('Failed to update project.json');
    return false;
  }

  const resCommit = await commitAndPush('Update Project publish');
  if (!resCommit.ok) {
    console.log('Failed to update project file: ', resCommit.error);
    return false;
  }

  // Now trigger the build
  const resultTrigger = await triggerWorkflow(
    userInfo.token,
    org,
    repo,
    'deploy-main.yml'
  );

  if (!resultTrigger.ok) {
    console.log('Failed to trigger deploy: ', resultTrigger.statusText);
    return false;
  }

  return true;
};
