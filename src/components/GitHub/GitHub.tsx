import LightningFS from '@isomorphic-git/lightning-fs';
import { useEffect, useState } from 'react';

import { Buffer } from 'buffer';
// @ts-ignore
globalThis.Buffer = Buffer;

import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

import './GitHub.css';

export interface GitHubProps {
  projectName: string;
}

export const GitHub = (props: GitHubProps) => {
  const { projectName } = props;

  const [fs, setFs] = useState<any | undefined>();
  const [repoExists, setRepoExists] = useState(false);
  const [repoCloned, setRepoCloned] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [ready, setReady] = useState(false);
  const [dirList, setDirList] = useState<string[]>([]);

  const dir = `/${projectName}`;

  useEffect(() => {
    if (!fs) {
      // @ts-ignore
      const _fs = new LightningFS('fs', { wipe: true });
      _fs.stat(dir, undefined, (err: Error, stats: LightningFS.Stats) => {
        if (err) {
          console.log(err);
          _fs.mkdir(dir, undefined, (error: any) => {
            if (error) {
              console.log(`Error creating dir: ${error}`);
              setRepoExists(false);
              setFs(undefined);
            } else {
              console.log('Dir made!');
              setFs(_fs);
              setRepoExists(false);
            }
          });
        } else {
          if (stats.type === 'dir') {
            console.log('Project Directory Already Exists!');
            setFs(_fs);
            setRepoExists(true);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (fs) {
      if (repoExists) {
        git
          .setConfig({
            fs,
            dir: dir,
            path: 'user.name',
            value: 'lwjameson',
          })
          .then(() =>
            git
              .pull({ fs, http, dir, ref: 'main', singleBranch: true })
              .then(() => {
                setUpdated(true);
                console.log('Latest version pulled');
              })
              .catch((err) =>
                console.error('Error pullung project repo: ', err)
              )
          );
      } else {
        git
          .clone({
            fs,
            http,
            dir,
            url: `https://github.com/AVAnnotate/${projectName}`,
            corsProxy: 'https://cors.isomorphic-git.org',
            singleBranch: true,
            depth: 1,
          })
          .then(() => {
            console.info('Repo Cloned!');
            setRepoCloned(true);
          })
          .catch((err) => console.error(`Error: ${err}`));
      }
    }
  }, [fs, repoExists]);

  const handleClick = (path: string) => {
    window.location.pathname = `en/files/${encodeURI(path)}`;
  };

  if (fs && repoCloned) {
    fs.readdir(`/${projectName}`, undefined, (err: any, dir: string[]) => {
      if (err) {
        console.log(`Error: ${err}`);
      }
      setDirList(dir);
    });
    return (
      <div>
        <h2>Git Repository Now Available</h2>
        <ul>
          {dirList
            .filter((d) => d.endsWith('.md'))
            .map((entry, idx) => {
              return (
                <li
                  key={idx}
                  className='git-hub-file'
                  onClick={() => handleClick(entry)}
                >
                  {entry}
                </li>
              );
            })}
        </ul>
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
};
