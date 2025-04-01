export const paginate = async (url: string, token: string) => {
  let results: any[] = [];

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    return results;
  }

  const data = await response.json();

  results = [...results, ...data];

  const link = response.headers.get('link');
  if (!link) {
    return results;
  }

  const parseLink = (linkStr: string) => {
    const linkArr = linkStr.split(',');
    const map: { [rel: string]: string } = {};
    linkArr.forEach((l) => {
      const vals = l.split(';');
      const rel = vals[1].substring(
        vals[1].indexOf('"') + 1,
        vals[1].lastIndexOf('"')
      );
      const url = vals[0].substring(
        vals[0].indexOf('<') + 1,
        vals[0].indexOf('>')
      );

      map[rel] = url;
    });

    return map;
  };

  let linkMap = parseLink(link);

  while (linkMap['next']) {
    const response = await fetch(linkMap['next'], {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const data = await response.json();

    results = [...results, ...data];

    if (linkMap['next'] === linkMap['last']) {
      break;
    }

    const link = response.headers.get('link');
    if (!link) {
      break;
    }
    linkMap = parseLink(link);
  }

  return results;
};

export const getCollaborators = async (
  repoName: string,
  owner: string,
  token: string
): Promise<Response> =>
  await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/collaborators`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

export const getInvitedCollaborators = async (
  repoName: string,
  owner: string,
  token: string
): Promise<Response> =>
  await fetch(`https://api.github.com/repos/${owner}/${repoName}/invitations`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

export const addCollaborator = async (
  repoName: string,
  org: string,
  collaborator: string,
  token: string
): Promise<Response> => {
  const body = {
    permission: 'push',
  };

  return await fetch(
    `https://api.github.com/repos/${org}/${repoName}/collaborators/${collaborator}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    }
  );
};

export const removeCollaborator = async (
  repoName: string,
  org: string,
  collaborator: string,
  token: string
): Promise<Response> => {
  return await fetch(
    `https://api.github.com/repos/${org}/${repoName}/collaborators/${collaborator}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
};

export const createRepositoryFromTemplate = async (
  templateRepo: string,
  org: string,
  token: string,
  newRepoName: string,
  description: string,
  visibility?: 'private' | 'public' // Defaults to private
): Promise<Response> => {
  const body = {
    owner: org,
    name: newRepoName,
    description: description,
    private: visibility !== 'public',
  };

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

export const addRepositoryHomepage = async (
  org: string,
  repoName: string,
  token: string,
  homePageURL: string
): Promise<Response> => {
  const body = {
    homepage: homePageURL,
  };

  return await fetch(`https://api.github.com/repos/${org}/${repoName}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });
};

export const removeRepositoryHomepage = async (
  org: string,
  repoName: string,
  token: string
): Promise<Response> => {
  const body = {
    homepage: '',
  };

  return await fetch(`https://api.github.com/repos/${org}/${repoName}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });
};

export const enablePages = async (
  org: string,
  repo: string,
  token: string
): Promise<Response> => {
  const body = {
    source: {
      branch: 'main',
      path: '/',
    },
    build_type: 'workflow',
  };
  return await fetch(`https://api.github.com/repos/${org}/${repo}/pages`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(body),
  });
};

export const disablePages = async (
  org: string,
  repo: string,
  token: string
): Promise<Response> => {
  return await fetch(`https://api.github.com/repos/${org}/${repo}/pages`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const getUserOrgs = async (token: string): Promise<any[]> => {
  return await paginate('https://api.github.com/user/orgs', token);
};

export const getUserMemberRepos = async (
  token: string,
  userName: string
): Promise<any[]> => {
  return await paginate(
    `https://api.github.com/users/${userName}/repos?per_page=100`,
    token
  );
};

export const getUserMemberReposInOrg = async (
  token: string,
  org: string
): Promise<any[]> => {
  return await paginate(
    `https://api.github.com/orgs/${org}/repos?per_page=100`,
    token
  );
};

export const getUserRepos = async (token: string): Promise<any[]> => {
  return await paginate(
    `https://api.github.com/user/repos?per_page=100`,
    token
  );
};

export const getRepoTopics = async (
  org: string,
  repo: string,
  token: string
): Promise<Response> => {
  return await fetch(`https://api.github.com/repos/${org}/${repo}/topics`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const replaceRepoTopics = async (
  org: string,
  repo: string,
  topics: string[],
  token: string
): Promise<Response> => {
  return await fetch(`https://api.github.com/repos/${org}/${repo}/topics`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ names: topics }),
  });
};

export const searchUsers = async (
  token: string,
  search: string
): Promise<Response> => {
  const encode = encodeURIComponent(
    `${decodeURIComponent(search)} in:name in:login type:user&per_page=10`
    // `lorin jameson in:name in:login type:user&per_page=10`
  );
  const url = `https://api.github.com/search/users?q=${encode}`;
  return await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const getUser = async (
  token: string,
  login: string
): Promise<Response> => {
  return await fetch(`https://api.github.com/users/${login}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const getRepo = async (
  token: string,
  org: string,
  slug: string
): Promise<Response> => {
  return await fetch(`https://api.github.com/repos/${org}/${slug}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};

export const changeRepoVisibility = async (
  token: string,
  org: string,
  slug: string,
  isPrivate: boolean
): Promise<Response> => {
  return await fetch(`https://api.github.com/repos/${org}/${slug}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      private: isPrivate,
    }),
  });
};

export const checkWorkflowStatus = async (
  token: string,
  org: string,
  slug: string
): Promise<Response> => {
  return await fetch(
    `https://api.github.com/repos/${org}/${slug}/actions/workflows/deploy-main.yml/runs?status=in_progress`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
};

export const signOut = async (token: string): Promise<Response> => {
  return await fetch(
    `https://api.github.com/applications/${
      import.meta.env.PUBLIC_GITHUB_CLIENT_ID
    }/token`,
    {
      method: 'GET',
      headers: {
        User: `${import.meta.env.PUBLIC_GITHUB_CLIENT_ID}:${
          import.meta.env.GITHUB_CLIENT_SECRET
        }`,
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
};
