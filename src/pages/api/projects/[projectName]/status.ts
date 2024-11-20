import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { checkWorkflowStatus } from '@lib/GitHub/index.ts';
import { parseSlug } from '@backend/projectHelpers.ts';

export const GET: APIRoute = async ({ cookies, params, redirect }) => {
  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  // Get params
  const { projectName } = params;

  const { org, repo } = parseSlug(projectName as string);

  const result = await checkWorkflowStatus(info?.token as string, org, repo);

  if (result.ok) {
    const body = await result.json();

    return new Response(JSON.stringify({ running_count: body.total_count }), {
      status: 200,
    });
  }

  return new Response(null, { status: 500 });
};
