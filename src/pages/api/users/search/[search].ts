import type { APIRoute } from 'astro';
import { userInfo } from '@backend/userInfo.ts';
import { searchUsers } from '@lib/GitHub/index.ts';

export const GET: APIRoute = async ({ cookies, params, request, redirect }) => {
  const { search } = params;

  const token = cookies.get('access-token');

  // Get the user info
  const info = await userInfo(cookies);

  if (!token || !info) {
    redirect('/', 307);
  }

  const users = await searchUsers(info?.token as string, search as string);

  if (users.ok) {
    const data = await users.json();

    const ret = [];

    for (let i = 0; i < data.items.length; i++) {
      ret.push(data.items[i]);
    }

    return new Response(JSON.stringify(ret), {
      status: 200,
    });
  }

  return new Response(null, {
    status: 500,
    statusText: users.statusText,
  });
};
