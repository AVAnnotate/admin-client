import { importIIIFManifest } from './src/lib/iiif/import';
import * as manifest from './data/multi-set-mainifest.json';

const main = () => {
  const result = importIIIFManifest(JSON.stringify(manifest));
};

main();
