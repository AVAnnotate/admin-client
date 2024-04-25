import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request, redirect, cookies }) => {
  const code = request.url.split('git?code=')[1];
  const data = new FormData();
  data.append('client_id', import.meta.env.PUBLIC_GITHUB_CLIENT_ID);
  data.append('client_secret', import.meta.env.GITHUB_CLIENT_SECRET);
  data.append('code', code);

  // Request to exchange code for an access token
  return await fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    body: data,
  })
    .then((response) => response.text())
    .then((paramsString) => {
      let params = new URLSearchParams(paramsString);
      const access_token = params.get('access_token');
      return new Response(undefined, {
        status: 302,
        headers: {
          'Set-Cookie': `access-token=${access_token}`,
          Location: `http://localhost:4321/redirect`,
        },
      });
    })
    .catch((error) => {
      console.log(error);
      return new Response(undefined, {
        status: 500,
      });
    });
};
