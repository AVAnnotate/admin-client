import type { IFs } from 'memfs';

export const readFile = (
  fs: IFs,
  relativePath: string,
  encoding?: 'utf8'
): Promise<Uint8Array | string> => {
  return fs
    .readFileSync(relativePath, encoding || 'utf8')
    .then((data: string) => data);
};
