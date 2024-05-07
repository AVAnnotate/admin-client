import { memfs } from 'memfs';

export const initFs = (name: string) => {
  return memfs(undefined, name).fs;
};
