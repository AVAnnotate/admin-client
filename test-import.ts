import { importIIIFManifest } from './src/lib/iiif/import.ts';
import * as manifest from './data/bernadette-mayer.json';

const main = async () => {
  const result = await importIIIFManifest(JSON.stringify(manifest), 'Tester');

  console.log(JSON.stringify(result, null, 2));
};

main();
