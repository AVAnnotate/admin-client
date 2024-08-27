import { vttToAnnotations } from "./src/lib/VTT/index.ts";
import fs from 'node:fs';

const main = () => {
  const data = fs.readFileSync('./data/sample.vtt');

  console.log(data.toString())
  const result = vttToAnnotations(data.toString(), 'speaker');

  console.log(JSON.stringify(result, null, 2));
};

main();