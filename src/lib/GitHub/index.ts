import type { ProviderUser } from '@ty/Types.ts';
import type {
  Collaborators,
  FullRepository,
  RepositoryInvitation,
} from '@ty/github.ts';

export const getCollaborators = async (
  repoName: string,
  token: string
): Promise<Response> =>
  await fetch(
    `https://api.github.com/repos/${
      import.meta.env.GIT_REPO_ORG
    }/${repoName}/collaborators`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

export const addCollaborator = async (
  repoName: string,
  collaborator: string,
  token: string
): Promise<Response> =>
  await fetch(
    `https://api.github.com/repos/${
      import.meta.env.GIT_REPO_ORG
    }/${repoName}/collaborators/${collaborator}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

export const createRepositoryFromTemplate = async (
  templateRepo: string,
  token: string,
  newRepoName: string,
  description: string,
  visibility?: 'private' | 'public' // Defaults to private
): Promise<Response> => {
  const body = {
    owner: import.meta.env.GIT_REPO_ORG,
    name: newRepoName,
    description: description,
    private: visibility !== 'public',
  };

  console.log('API Body: ', body);
  console.log('Org: ', import.meta.env.GIT_REPO_ORG);
  return await fetch(
    `https://api.github.com/repos/${
      import.meta.env.GIT_REPO_ORG
    }/${templateRepo}/generate`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    }
  );
};
