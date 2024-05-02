import type { WriteFileOptions } from '@isomorphic-git/lightning-fs';
import type FS from '@isomorphic-git/lightning-fs';
import git, { type PushResult } from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { useEffect, useState } from 'react';
import type { UserInfo } from '@ty/Types.ts';

interface UseGitProps {
  fs: FS.PromisifiedFS;
  workingDir: string;
  repositoryURL: string;
  branch?: string;
  proxyUrl?: string;
  userInfo: UserInfo;
  token: string;
  onError(error: string): void;
}
export const useGit = (props: UseGitProps) => {
  useEffect(() => {
    git
      .clone({
        fs: props.fs,
        http,
        dir: props.workingDir,
        url: props.repositoryURL,
        corsProxy: props.proxyUrl,
        singleBranch: props.branch ? true : false,
        depth: 1,
        ref: props.branch ? props.branch : undefined,
      })
      .then(() => true);
  }, []);

  const writeFile = (
    relativePath: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ): Promise<boolean> => {
    return props.fs
      .writeFile(`${props.workingDir}/${relativePath}`, data, options)
      .then(() => true);
  };

  const readFile = (
    relativePath: string,
    encoding?: 'utf8'
  ): Promise<Uint8Array | string> => {
    return props.fs
      .readFile(`${props.workingDir}/${relativePath}`, {
        encoding: encoding ? encoding : undefined,
      })
      .then((data) => data);
  };

  const commitAndPush = (branch: string, message: string): Promise<boolean> => {
    return git
      .commit({
        fs: props.fs,
        dir: props.workingDir,
        author: {
          name: props.userInfo.profile.name,
          email: props.userInfo.profile.email,
        },
        message,
      })
      .then((sha: string) => {
        return git
          .push({
            fs: props.fs,
            http,
            dir: props.workingDir,
            remote: 'origin',
            ref: branch,
            onAuth: () => ({
              username: props.token,
            }),
          })
          .then((result: PushResult) => {
            if (result.ok) {
              return true;
            }
            props.onError(result.error as string);
            return false;
          })
          .catch((error) => {
            props.onError(error);
            return false;
          });
      })
      .catch((error) => {
        props.onError(error);
        return false;
      });
  };

  return { writeFile, readFile };
};
