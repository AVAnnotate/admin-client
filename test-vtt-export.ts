// @ts-ignore
import { annotationsToVtt, vttToAnnotations } from './src/lib/VTT/index.ts';
// @ts-ignore
import data from './data/test-annotations.json';
import type { AnnotationEntry } from '@ty/Types.ts';

const main = () => {
  //console.log(JSON.stringify(data));
  const result = annotationsToVtt(
    data.annotations as AnnotationEntry[],
    'speaker'
  );

  console.log(result);

  const result2 = vttToAnnotations(result.toString(), 'speaker');

  console.log(JSON.stringify(result2, null, 2));
};

main();
