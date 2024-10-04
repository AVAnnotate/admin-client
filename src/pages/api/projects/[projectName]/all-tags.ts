import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { deleteAll } from '@backend/tagHelpers.ts';
import { parseSlug } from '@backend/projectHelpers.ts';
import type { UserInfo } from '@ty/Types.ts';

export const DELETE: APIRoute = async ({ cookies, params, redirect }) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  // Get params
  const { projectName } = params;

  const { org, repo } = parseSlug(projectName as string);

  const baseUrl = 'https://github.com';
  const repoUrl = `${baseUrl}/${org}/${repo}`;
  const result = await deleteAll(repoUrl, info as UserInfo);

  if (result) {
    return new Response(JSON.stringify({ project: result }), { status: 200 });
  }

  return new Response(null, { status: 500 });
};
