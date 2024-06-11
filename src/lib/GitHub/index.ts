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

  let link = response.headers.get('link');
  if (!link) {
    return results;
  }

  const parseLink = (linkStr: string) => {
    let linkArr = linkStr.split(',');
    let map: { [rel: string]: string } = {};
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

    let link = response.headers.get('link');
    if (!link) {
      break;
    }
    linkMap = parseLink(link);
  }

  return results;
};

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
  org: string,
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
    `https://api.github.com/repos/${org}/${templateRepo}/generate`,
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
    https_enforced: true,
  };
  console.log('API Body: ', body);
  console.log('Repo: ', repo);
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
    `https://api.github.com/orgs/${org}/repos?type=member&per_page=100`,
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
  //console.log(url);
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
