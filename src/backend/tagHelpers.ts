import type {
  TagGroup,
  ProjectData,
  UserInfo,
  AnnotationPage,
  Tag,
} from '@ty/Types.ts';
import { gitRepo, type GitRepoContext } from './gitRepo.ts';
import { initFs } from '@lib/memfs/index.ts';
import {
  getPageData,
  getDirData,
  buildProjectData,
} from '@backend/projectHelpers.ts';

export const createTagGroup = async (
  htmlUrl: string,
  userInfo: UserInfo,
  group: TagGroup
): Promise<ProjectData | undefined> => {
  const fs = initFs();

  const { readFile, writeFile, readDir, exists, commitAndPush } = await gitRepo(
    {
      fs: fs,
      repositoryURL: htmlUrl,
      branch: 'main',
      userInfo: userInfo,
    }
  );

  const proj = readFile('/data/project.json');

  const project: ProjectData = JSON.parse(proj as string);

  project.project.tags?.tagGroups.push(group);

  const result = await writeFile('/data/project.json', JSON.stringify(project));

  if (!result) {
    return undefined;
  }

  const resPush = await commitAndPush(`Adding Tag Group ${group.category}`);

  if (resPush.ok) {
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

    project.events = getDirData(
      fs,
      eventFiles as unknown as string[],
      'events'
    );

    const pageData = getPageData(fs, pageFiles as unknown as string[], 'pages');

    project.pages = pageData.pages;
    project.pageOrder = pageData.order;

    return project;
  }
  return undefined;
};

export const updateTagGroup = async (
  htmlUrl: string,
  userInfo: UserInfo,
  oldGroup: TagGroup,
  newGroup: TagGroup
): Promise<ProjectData | undefined> => {
  const fs = initFs();

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  // Get the project
  const project: ProjectData = JSON.parse(proj as string);

  // Move all tags in this group to the _uncategorized_ group
  // Make sure we have an _uncategorized_ group
  const groupIdx = project.project.tags!.tagGroups.findIndex(
    (g) => g.category === oldGroup.category
  );

  if (groupIdx < 0) {
    console.log('Did not find old group, error');
    return undefined;
  }

  // Reassign tags
  for (let i = 0; i < project.project.tags.tags.length; i++) {
    let tag = project.project.tags.tags[i];

    if (tag.category === oldGroup.category) {
      tag.category = newGroup.category;
    }
  }

  // delete the tag group
  const idx = project.project.tags.tagGroups.findIndex(
    (g) => g.category === oldGroup.category
  );
  if (idx > -1) {
    project.project.tags.tagGroups[idx] = newGroup;
  } else {
    console.log('Did not find old group, error');
    return undefined;
  }

  // No need to update tags ir only the color changed
  if (oldGroup.category !== newGroup.category) {
    const resultRegroup = await regroupTags(
      oldGroup.category,
      newGroup.category,
      context
    );
    if (!resultRegroup) {
      return undefined;
    }
  }

  const result = await writeFile('/data/project.json', JSON.stringify(project));

  if (!result) {
    return undefined;
  }

  buildProjectData(project, context);

  const resPush = await commitAndPush(
    `Updating Tag Group ${oldGroup.category} to ${newGroup.category}`
  );

  if (resPush.ok) {
    return project;
  }

  return undefined;
};

export const deleteTagGroup = async (
  htmlUrl: string,
  userInfo: UserInfo,
  group: TagGroup
): Promise<ProjectData | undefined> => {
  const fs = initFs();

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  // Get the project
  const project: ProjectData = JSON.parse(proj as string);

  // Move all tags in this group to the _uncategorized_ group
  // Make sure we have an _uncategorized_ group
  const groupIdx = project.project.tags!.tagGroups.findIndex(
    (g) => g.category === '_uncategorized_'
  );

  if (groupIdx < 0) {
    console.log('Did not find _uncategroized_, adding');
    // Add the _uncategorized_ group
    project.project.tags?.tagGroups.push({
      color: '#A3A3A3',
      category: '_uncategorized_',
    });
  }

  // Reassign tags
  for (let i = 0; i < project.project.tags.tags.length; i++) {
    let tag = project.project.tags.tags[i];

    if (tag.category === group.category) {
      tag.category = '_uncategorized_';
    }
  }

  // delete the tag group
  const idx = project.project.tags.tagGroups.findIndex(
    (g) => g.category === group.category
  );
  if (idx > -1) {
    project.project.tags.tagGroups.splice(idx, 1);
  }

  const resultRegroup = await regroupTags(
    group.category,
    '_uncategorized_',
    context
  );

  if (resultRegroup) {
    const result = await writeFile(
      '/data/project.json',
      JSON.stringify(project)
    );

    if (!result) {
      return undefined;
    }

    buildProjectData(project, context);

    const resPush = await commitAndPush(`Removing Tag Group ${group.category}`);

    if (resPush.ok) {
      return project;
    }
  }

  return undefined;
};

const regroupTags = async (
  oldCategory: string,
  newCategory: string,
  repoContext: GitRepoContext
): Promise<boolean> => {
  const { exists, readDir, writeFile, options } = repoContext;
  // Read through all the annotations and update
  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations', '.json')
    : [];

  const annos = getDirData(
    options.fs,
    annotationFiles as unknown as string[],
    'annotations'
  );

  for (const key in annos) {
    const annoPage: AnnotationPage = annos[key];

    for (let i = 0; i < annoPage.annotations.length; i++) {
      let annotation = annoPage.annotations[i];
      for (let j = 0; j < annotation.tags.length; j++) {
        let tag = annotation.tags[j];
        if (tag.category === oldCategory) {
          tag.category = newCategory;
        }
      }
    }

    // Write the file back
    const writeResult = await writeFile(
      `/data/annotations/${key}.json`,
      JSON.stringify(annoPage)
    );
    if (!writeResult) {
      return false;
    }
  }

  return true;
};

export const addTag = async (htmlUrl: string, userInfo: UserInfo, tag: Tag) => {
  const fs = initFs();

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  // Get the project
  const project: ProjectData = JSON.parse(proj as string);

  // Add the tag
  project.project.tags.tags.push(tag);

  // Write, commit, save
  const writeResult = await writeFile(
    '/data/project.json',
    JSON.stringify(project)
  );

  if (writeResult) {
    const commitResult = await commitAndPush(`Added tag ${tag.tag}`);

    if (commitResult.ok) {
      buildProjectData(project, context);
      return project;
    }
  }

  return undefined;
};

export const updateTag = async (
  htmlUrl: string,
  userInfo: UserInfo,
  oldTag: Tag,
  newTag: Tag
) => {
  const fs = initFs();

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  // Get the project
  const project: ProjectData = JSON.parse(proj as string);

  // Remove old tag
  const idx = project.project.tags.tags.findIndex(
    (t) => t.category === oldTag.category && t.tag === oldTag.tag
  );

  if (idx > -1) {
    // Add the tag
    project.project.tags.tags.splice(idx, 1);
    project.project.tags.tags.push(newTag);

    // Update all existing tags
    const updateResult = await updateAllTags(oldTag, newTag, context);

    if (updateResult) {
      // Write, commit, save
      const writeResult = await writeFile(
        '/data/project.json',
        JSON.stringify(project)
      );

      if (writeResult) {
        const commitResult = await commitAndPush(
          `Added tags ${oldTag.tag} to ${newTag.tag}`
        );

        if (commitResult.ok) {
          buildProjectData(project, context);
          return project;
        }
      }
    }
  }

  return undefined;
};

const updateAllTags = async (
  oldTag: Tag,
  newTag: Tag,
  repoContext: GitRepoContext
): Promise<boolean> => {
  const { exists, readDir, writeFile, options } = repoContext;
  // Read through all the annotations and update
  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations', '.json')
    : [];

  const annos = getDirData(
    options.fs,
    annotationFiles as unknown as string[],
    'annotations'
  );

  for (const key in annos) {
    const annoPage: AnnotationPage = annos[key];

    for (let i = 0; i < annoPage.annotations.length; i++) {
      let annotation = annoPage.annotations[i];
      for (let j = 0; j < annotation.tags.length; j++) {
        let tag = annotation.tags[j];
        if (tag.category === oldTag.category && tag.tag === oldTag.tag) {
          annotation.tags[j] = newTag;
        }
      }
    }

    // Write the file back
    const writeResult = await writeFile(
      `/data/annotations/${key}.json`,
      JSON.stringify(annoPage)
    );
    if (!writeResult) {
      return false;
    }
  }

  return true;
};

export const deleteTag = async (
  htmlUrl: string,
  userInfo: UserInfo,
  tag: Tag
) => {
  const fs = initFs();

  const { readFile, writeFile, commitAndPush, context } = await gitRepo({
    fs: fs,
    repositoryURL: htmlUrl,
    branch: 'main',
    userInfo: userInfo,
  });

  const proj = readFile('/data/project.json');

  // Get the project
  const project: ProjectData = JSON.parse(proj as string);

  // Delete the tag
  const idx = project.project.tags.tags.findIndex(
    (t) => t.category === tag.category && t.tag === tag.tag
  );
  if (idx > -1) {
    project.project.tags.tags.splice(idx, 1);

    // Write project file
    const writeResult = await writeFile(
      '/data/project.json',
      JSON.stringify(project)
    );

    if (writeResult) {
      // Delete all matching tags
      const resultDel = await deleteAllTags(tag, context);
      if (resultDel) {
        // Commit and push the repo
        const commitResult = await commitAndPush(`Added tag ${tag.tag}`);

        if (commitResult.ok) {
          buildProjectData(project, context);
          return project;
        }
      }
    }
  }

  return undefined;
};

const deleteAllTags = async (
  tag: Tag,
  repoContext: GitRepoContext
): Promise<boolean> => {
  const { exists, readDir, writeFile, options } = repoContext;
  // Read through all the annotations and update
  const annotationFiles = exists('/data/annotations')
    ? readDir('/data/annotations', '.json')
    : [];

  const annos = getDirData(
    options.fs,
    annotationFiles as unknown as string[],
    'annotations'
  );

  for (const key in annos) {
    const annoPage: AnnotationPage = annos[key];

    for (let i = 0; i < annoPage.annotations.length; i++) {
      let annotation = annoPage.annotations[i];
      let j = annotation.tags.length;
      while (j--) {
        const t = annotation.tags[j];
        if (t.category === tag.category && t.tag === tag.tag) {
          annoPage.annotations[i].tags.splice(j, 1);
        }
      }
    }

    // Write the file back
    const writeResult = await writeFile(
      `/data/annotations/${key}.json`,
      JSON.stringify(annoPage)
    );
    if (!writeResult) {
      return false;
    }
  }

  return true;
};
