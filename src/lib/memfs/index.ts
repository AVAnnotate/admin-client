import { memfs } from 'memfs';

export const initFs = () => {
  return memfs().fs;
};
