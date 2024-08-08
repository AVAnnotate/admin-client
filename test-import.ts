import { importIIIFManifest } from './src/lib/iiif/import.ts';
import * as manifest from './data/multi-set-mainifest.json';

const main = () => {
  const result = importIIIFManifest(JSON.stringify(manifest), 'Tester');

  console.log(JSON.stringify(result, null, 2));
};

main();
