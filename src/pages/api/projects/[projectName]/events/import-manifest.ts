import { userInfo } from '@backend/userInfo.ts';
import type { apiImportManifest } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { importIIIFManifest } from '@lib/iiif/import.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo, Event, ProjectData } from '@ty/Types.ts';
import { emptyParagraph } from '@lib/slate/index.tsx';
import { autoGenerateEventPage } from '@lib/pages/autogenerate.ts';
import { setTemplate } from '@lib/annotations/index.ts';
import { v4 as uuidv4 } from 'uuid';

// Create a new event
export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') !== 'application/json') {
    return new Response(null, { status: 400 });
  }

  const { projectName } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !projectName) {
    return redirect('/', 307);
  }

  const body: apiImportManifest = await request.json();

  if (body.manifest_url) {
    const dataResp = await fetch(body.manifest_url);

    if (dataResp.ok) {
      const data = await dataResp.json();

      const results = await importIIIFManifest(
        JSON.stringify(data, null, 2),
        info.profile.gitHubName as string
      );

      // Create new event and annotation records
      const repositoryURL = getRepositoryUrl(projectName);

      const { writeFile, readFile, commitAndPush, context } = await gitRepo({
        fs: initFs(),
        repositoryURL,
        branch: 'main',
        userInfo: info as UserInfo,
      });

      const projectStr = readFile('/data/project.json');

      if (!projectStr) {
        return new Response(null, {
          status: 400,
          statusText: 'No project file found',
        });
      }

      const project: ProjectData = JSON.parse(projectStr as string);

      for (let i = 0; i < results.events.length; i++) {
        const eventRec = results.events[i];
        if (
          !body.event_labels ||
          body.event_labels.length === 0 ||
          body.event_labels.includes(eventRec.event.label)
        ) {
          const eventPath = `/data/events/${eventRec.id}.json`;
          const event: Event = {
            ...eventRec.event,
            description: body.description || emptyParagraph,
            auto_generate_web_page: body.auto_generate_web_page,
          };
          await writeFile(eventPath, JSON.stringify(event, null, 2));

          if (body.auto_generate_web_page) {
            await autoGenerateEventPage(context, info, event, eventRec.id);
          }

          if (
            results.annotations.length === 0 ||
            results.annotations.filter(
              (a) => a.annotation.event_id === eventRec.id
            ).length === 0
          ) {
            // generate default annotation set for each AV file
            const keys = Object.keys(eventRec.event.audiovisual_files);
            for (let j = 0; j < keys.length; j++) {
              const key = keys[j];
              const defaultSetUuid = uuidv4();

              const successSet = await writeFile(
                `/data/annotations/${defaultSetUuid}.json`,
                JSON.stringify(
                  {
                    ...setTemplate,
                    event_id: eventRec.id,
                    source_id: key,
                  },
                  null,
                  2
                )
              );

              if (!successSet) {
                console.error('Failed to write default set');
                return new Response(null, {
                  status: 500,
                  statusText: 'Failed to write default set',
                });
              }
            }
          } else {
            // Find any matching annotations
            for (let j = 0; j < results.annotations.length; j++) {
              const annoRec = results.annotations[j];
              if (annoRec.annotation.event_id === eventRec.id) {
                const annoPath = `/data/annotations/${annoRec.id}.json`;
                await writeFile(
                  annoPath,
                  JSON.stringify(annoRec.annotation, null, 2)
                );
              }
            }
          }
        }
      }

      if (results.tags.length > 0) {
        // Add any new tags
        if (
          project.project.tags.tagGroups.findIndex(
            (g) => g.category === '_uncategorized_'
          ) === -1
        ) {
          project.project.tags?.tagGroups.push({
            color: '#A3A3A3',
            category: '_uncategorized_',
          });
        }

        results.tags.forEach((t) => {
          if (
            project.project.tags.tags.findIndex((tg) => tg.tag === t) === -1
          ) {
            project.project.tags.tags.push({
              category: '_uncategorized_',
              tag: t,
            });
          }
        });

        project.project.updated_at = new Date().toISOString();

        await writeFile('/data/project.json', JSON.stringify(project, null, 2));
      }

      const successCommit = await commitAndPush(
        `Imported manifest ${body.manifest_url}`
      );

      if (successCommit.error) {
        console.error(
          'Failed to write manifest import data: ',
          successCommit.error
        );
        return new Response(null, {
          status: 500,
          statusText:
            'Failed to write manifest import data: ' + successCommit.error,
        });
      }

      return new Response(JSON.stringify(results), { status: 200 });
    }
  }

  return new Response(null, { status: 400 });
};
