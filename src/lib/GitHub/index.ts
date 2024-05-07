import type { ProviderUser } from '@ty/Types.ts';

export const getCollaborators = async (
  repo: string,
  token: string
): Promise<ProviderUser[]> => {
  const response = await fetch(
    `https://api.github.com/repos/${
      import.meta.env.GIT_REPO_ORG
    }/${repo}/collaborators`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  const body = await response.json();
  return body.map((user: any) => {
    return {
      loginName: user.login,
      avatarURL: user.avatar_url,
      admin: user.site_admin,
    };
  });
};
