import type { IFs } from 'memfs';
import type { UserInfo } from '@ty/Types.ts';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import type { PushResult } from 'isomorphic-git';

interface GitRepoOptions {
  fs: IFs;
  workingDir: string;
  repositoryURL: string;
  branch?: string;
  proxyUrl?: string;
  userInfo: UserInfo;
}

export const gitRepo = async (options: GitRepoOptions) => {
  await git.clone({
    fs: options.fs,
    http,
    dir: options.workingDir,
    url: options.repositoryURL,
    corsProxy: options.proxyUrl,
    singleBranch: options.branch ? true : false,
    depth: 1,
    ref: options.branch ? options.branch : undefined,
    onAuth: () => ({
      username: options.userInfo.token,
    }),
  });

  const writeFile = async (
    fs: IFs,
    workingDir: string,
    relativePath: string,
    data: Uint8Array,
    options?: any
  ): Promise<boolean> => {
    return fs.writeFile(`${workingDir}/${relativePath}`, data, options);
  };

  const readFile = async (
    fs: IFs,
    workingDir: string,
    relativePath: string,
    encoding?: 'utf8'
  ): Promise<Uint8Array | string> => {
    return fs.readFileSync(`${workingDir}${relativePath}`, encoding || 'utf8');
  };

  const commitAndPush = async (
    fs: IFs,
    workingDir: string,
    userInfo: UserInfo,
    branch: string,
    message: string
  ): Promise<PushResult> => {
    const sha = await git.commit({
      fs: fs,
      dir: workingDir,
      author: {
        name: userInfo.profile.name,
        email: userInfo.profile.email,
      },
      message,
    });

    return git.push({
      fs: fs,
      http,
      dir: workingDir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({
        username: userInfo.token,
      }),
    });
  };

  return { writeFile, readFile, commitAndPush };
};
