import { type IFs } from 'memfs';
import type { UserInfo } from '@ty/Types.ts';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import type { PushResult } from 'isomorphic-git';

interface GitRepoOptions {
  fs: IFs;
  repositoryURL: string;
  branch?: string;
  userInfo: UserInfo;
}

export const gitRepo = async (options: GitRepoOptions) => {
  const { fs } = options;
  try {
    await git.clone({
      fs: options.fs,
      http,
      dir: '/',
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

    console.log('Repo cloned!');
    const dir = await fs.promises.readdir('/');
    console.log('Dir: ', dir);
  } catch (err) {
    console.log(err);
  }

  const writeFile = async (
    absoluteFileName: string,
    data: string,
    writeOptions?: any
  ): Promise<boolean> => {
    fs.writeFileSync(absoluteFileName, data, writeOptions);
    console.log('File written!');
    await git.add({
      fs,
      dir: '/',
      filepath: absoluteFileName.slice(1),
    });

    const status = await git.statusMatrix({
      fs,
      dir: '/',
    });
    console.log(status);
    return true;
  };

  const readFile = (
    absoluteFileName: string,
    encoding?: 'utf8'
  ): Uint8Array | string => {
    return fs.readFileSync(absoluteFileName, encoding || 'utf8');
  };

  const readDir = (absoluteDirectoryName: string) => {
    return fs.readdirSync(absoluteDirectoryName);
  };

  const deleteFile = (absoluteFileName: string) => {
    console.log(absoluteFileName);
    return fs.rmSync(absoluteFileName);
  };

  const exists = (absolutePath: string) => {
    try {
      fs.statSync(absolutePath);
      return true;
    } catch {
      return false;
    }
  };

  const commitAndPush = async (message: string): Promise<PushResult> => {
    await git.setConfig({
      fs,
      dir: '/',
      path: 'user.name',
      value: options.userInfo.profile.gitHubName,
    });

    // todo: not working with deleted files
    const sha = await git.commit({
      fs: fs,
      dir: '/',
      author: {
        name: options.userInfo.profile.name,
        email: options.userInfo.profile.email,
      },
      message,
    });

    if (!sha) {
      return { ok: false, error: 'Failed to commit changes', refs: {} };
    }

    const commits = await git.log({ fs, dir: '/', depth: 1 });
    console.log('After commit log: ', commits[0]);

    return git.push({
      fs: fs,
      http,
      url: options.repositoryURL,
      dir: '/',
      remote: 'origin',
      ref: options.branch,
      onAuth: () => ({
        username: options.userInfo.token,
      }),
    });
  };

  return { deleteFile, exists, writeFile, readDir, readFile, commitAndPush };
};
