import { getRepo } from '@lib/GitHub/index.ts';
import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { getProject } from '@backend/projectHelpers.ts';

export const GET: APIRoute = async ({ cookies, params, redirect }) => {
  const { org, repository } = params;

  const token = cookies.get('access-token');
  const info = await userInfo(cookies);

  if (!token || !info || !org || !repository) {
    return redirect('/', 307);
  }

  const data = await getProject(
    info,
    `https://github.com/${org}/${repository}`
  );

  if (!data) {
    return new Response(null, { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
};
