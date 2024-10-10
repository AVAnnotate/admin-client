import type { Annotation, CaptionSet } from '@ty/Types.ts';
import type { GitRepoContext } from './gitRepo.ts';
import { annotationsToVtt } from '@lib/VTT/index.ts';

export const generateVTTFile = async (
  captionSet: CaptionSet,
  context: GitRepoContext
) => {
  // Read the annotation file
  const anno = context.readFile(
    `/data/annotations/${captionSet.annotation_page_id}.json`
  );

  if (anno) {
    const page: Annotation = JSON.parse(anno as string);
    const vttFile = annotationsToVtt(
      page.annotations,
      captionSet.speaker_category || ''
    );

    // ensure we have a vtt directory
    if (!context.exists('/data/vtt')) {
      context.mkDir('/data/vtt');
    }

    // Write the file
    await context.writeFile(
      `/data/vtt/${captionSet.annotation_page_id}.vtt`,
      vttFile
    );
  }
};
