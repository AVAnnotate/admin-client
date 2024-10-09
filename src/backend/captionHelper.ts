import type { Annotation } from '@ty/Types.ts';
import type { GitRepoContext } from './gitRepo.ts';
import { annotationsToVtt } from '@lib/VTT/index.ts';

export const generateVTTFile = (
  annotationUUID: string,
  context: GitRepoContext
) => {
  // Read the annotation file
  const anno = context.readFile(`/data/annotations/${annotationUUID}.json`);

  if (anno) {
    const page: Annotation = JSON.parse(anno as string);
    const vttFile = annotationsToVtt(page.annotations, 'speaker');

    // ensure we have a vtt directory
    if (!context.exists('/data/vtt')) {
      context.mkDir('/data/vtt');
    }

    // Write the file
    context.writeFile(`/data/vtt/${annotationUUID}.vtt`, vttFile);
  }
};
