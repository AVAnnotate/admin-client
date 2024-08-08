import { userInfo } from '@backend/userInfo.ts';
import type { apiAnalyzeManifest } from '@ty/api.ts';
import type { APIRoute } from 'astro';
import { importIIIFManifest } from '@lib/iiif/import.ts';

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

  const body: apiAnalyzeManifest = await request.json();

  if (body.manifest_url) {
    const dataResp = await fetch(body.manifest_url);

    if (dataResp.ok) {
      const data = await dataResp.json();

      const results = importIIIFManifest(
        JSON.stringify(data),
        info.profile.gitHubName as string
      );

      return new Response(JSON.stringify(results), { status: 200 });
    }
  }

  return new Response(null, { status: 400 });
};
