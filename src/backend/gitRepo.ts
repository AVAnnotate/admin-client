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
  try {
    await git.clone({
      fs: options.fs,
      http,
      dir: options.workingDir,
      url: options.repositoryURL,
      singleBranch: options.branch ? true : false,
      depth: 1,
      ref: options.branch ? options.branch : undefined,
      onProgress: (event) => {
        //console.log('Progress: ', event.loaded / event.total);
      },
      onAuth: () => {
        //console.log('In Auth. token: ', options.userInfo.token);
        return {
          username: options.userInfo.token,
        };
      },
      onAuthFailure: (url, auth) => {
        console.log('Auth Failed!');
        return { cancel: true };
      },
      onAuthSuccess: (url, auth) => console.log('Auth Success!'),
    });
  } catch (err) {
    console.log(err);
  }

  console.log('Repo cloned!');

  const writeFile = async (
    fs: IFs,
    workingDir: string,
    relativePath: string,
    data: string,
    options?: any
  ): Promise<boolean> => {
    fs.writeFileSync(`${workingDir}/${relativePath}`, data, options);
    return true;
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
