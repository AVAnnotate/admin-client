import { userInfo } from '@backend/userInfo.ts';
import type { apiImportManifest } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { importIIIFManifest } from '@lib/iiif/import.ts';
import { gitRepo } from '@backend/gitRepo.ts';
import { getRepositoryUrl } from '@backend/projectHelpers.ts';
import { initFs } from '@lib/memfs/index.ts';
import type { UserInfo, Event } from '@ty/Types.ts';

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

      const results = importIIIFManifest(
        JSON.stringify(data),
        info.profile.gitHubName as string
      );

      // Create new event and annotation records
      const repositoryURL = getRepositoryUrl(projectName);

      const { writeFile, commitAndPush } = await gitRepo({
        fs: initFs(),
        repositoryURL,
        branch: 'main',
        userInfo: info as UserInfo,
      });

      for (let i = 0; i < results.events.length; i++) {
        const eventRec = results.events[i];
        if (!body.event_ids || body.event_ids.includes(eventRec.id)) {
          const eventPath = `/data/events/${eventRec.id}.json`;
          const event: Event = {
            ...eventRec.event,
            description: body.description,
            auto_generate_web_page: body.auto_generate_web_page,
          };
          await writeFile(eventPath, JSON.stringify(event));

          // Find any matching annotations
          for (let j = 0; j < results.annotations.length; j++) {
            const annoRec = results.annotations[j];
            if (annoRec.annotation.event_id === eventRec.id) {
              const annoPath = `/data/annotations/${annoRec.id}.json`;
              await writeFile(annoPath, JSON.stringify(annoRec.annotation));
            }
          }
        }
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
