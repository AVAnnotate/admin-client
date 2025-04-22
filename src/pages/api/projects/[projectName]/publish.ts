import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { parseSlug, publishSite } from '@backend/projectHelpers.ts';
import { type apiPublishSite } from '@ty/api.ts';
import type { UserInfo } from '@ty/Types.ts';

export const POST: APIRoute = async ({
  request,
  cookies,
  params,
  redirect,
}) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  // Get params
  const { projectName } = params;

  const { org, repo } = parseSlug(projectName as string);

  const body: apiPublishSite = await request.json();

  const result = await publishSite(
    info as UserInfo,
    org,
    repo,
    projectName as string,
    body
  );

  if (result) {
    return new Response(null, {
      status: 200,
    });
  }

  return new Response(null, { status: 500 });
};
