import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { getUser } from '@lib/GitHub/index.ts';

export const GET: APIRoute = async ({ cookies, params, redirect }) => {
  const { login } = params;

  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  const user = await getUser(info?.token as string, login as string);

  if (user.ok) {
    const data = await user.json();

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  }

  return new Response(null, {
    status: 500,
    statusText: user.statusText,
  });
};
