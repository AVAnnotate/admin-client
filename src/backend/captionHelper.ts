import type { Annotation, CaptionSet, Event } from '@ty/Types.ts';
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

export const checkVTTUpdate = async (
  annotations: Annotation,
  annotationId: string,
  context: GitRepoContext
) => {
  // If the vtt file exists, get the event and then update
  if (
    context.exists('/data/vtt') &&
    context.exists(`/data/vtt/${annotationId}.vtt`)
  ) {
    const eventFile = context.readFile(
      `/data/events/${annotations.event_id}.json`
    );
    const event: Event = JSON.parse(eventFile as string);

    // Find the set
    const set = event.audiovisual_files[
      annotations.source_id
    ].caption_set?.find((s) => s.annotation_page_id === annotationId);

    if (set) {
      const vttFile = annotationsToVtt(
        annotations.annotations,
        set.speaker_category || ''
      );

      // Write the file
      await context.writeFile(`/data/vtt/${annotationId}.vtt`, vttFile);
    }
  }
};

export const checkVTTDelete = async (
  eventId: string,
  sourceId: string,
  annotationId: string,
  context: GitRepoContext
) => {
  // If the vtt file exists, get the event and then update
  if (
    context.exists('/data/vtt') &&
    context.exists(`/data/vtt/${annotationId}.vtt`)
  ) {
    const eventFile = context.readFile(`/data/events/${eventId}.json`);
    const event: Event = JSON.parse(eventFile as string);

    // Find the set
    const set = event.audiovisual_files[sourceId].caption_set?.find(
      (s) => s.annotation_page_id === annotationId
    );

    if (set) {
      // Write the file
      context.deleteFile(`/data/vtt/${annotationId}.vtt`);
    }
  }
};
