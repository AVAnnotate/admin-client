import FS from '@isomorphic-git/lightning-fs';
import type { Options } from '@isomorphic-git/lightning-fs';

export const initFs = (name: string, options?: Options) => {
  const pfs = new FS(name, options);
  return pfs.promises;
};
