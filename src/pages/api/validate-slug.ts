import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import type { apiValidateSlug } from '@ty/api.ts';
import { getRepo } from '@lib/GitHub/index.ts';

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const token = cookies.get('access-token');

    // Get the user info
    const info = await userInfo(cookies);

    if (!token || !info) {
      redirect('/', 307);
    }

    const body: apiValidateSlug = await request.json();

    const resp = await getRepo(token?.value as string, body.org, body.slug);

    if (resp.status === 404) {
      return new Response(null, { status: 200 });
    } else {
      const data = await resp.json();

      if (data.message === 'Not Found') {
        return new Response(null, { status: 200 });
      } else {
        return new Response(null, { status: 400 });
      }
    }
  }

  return new Response(null, {
    status: 400,
    statusText: 'Must be JSON data',
  });
};
