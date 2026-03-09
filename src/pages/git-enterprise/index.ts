import type { APIRoute } from 'astro';

// OAuth callback for UTexas GitHub Enterprise Managed User (EMU) login.
// GitHub redirects here after the user authorises the enterprise OAuth app at
// https://github.com/enterprises/utexas-internal.
// Required environment variables:
//   PUBLIC_UTEXAS_GITHUB_CLIENT_ID  – Client ID of the OAuth App registered
//                                     inside the UTexas enterprise.
//   UTEXAS_GITHUB_CLIENT_SECRET     – Corresponding client secret (server-side
//                                     only; never exposed to the browser).
export const GET: APIRoute = async ({ request }) => {
  const code = new URL(request.url).searchParams.get('code');
  const data = new FormData();
  data.append('client_id', import.meta.env.PUBLIC_UTEXAS_GITHUB_CLIENT_ID);
  data.append('client_secret', import.meta.env.UTEXAS_GITHUB_CLIENT_SECRET);
  data.append('code', code ?? '');

  // Exchange the authorisation code for an access token using the standard
  // GitHub OAuth endpoint (same endpoint used for both regular and EMU apps).
  return await fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    body: data,
  })
    .then((response) => response.text())
    .then((paramsString) => {
      const params = new URLSearchParams(paramsString);
      const access_token = params.get('access_token');
      if (!access_token) {
        console.error(
          'UTexas OAuth token exchange failed: no access_token in response',
          paramsString
        );
        return new Response(undefined, { status: 401 });
      }
      return new Response(undefined, {
        status: 302,
        headers: {
          'Set-Cookie': `access-token=${access_token}; HttpOnly; SameSite=Lax; Path=/`,
          Location: `${import.meta.env.PUBLIC_REDIRECT_URL}/en/projects`,
        },
      });
    })
    .catch((error) => {
      console.error('UTexas OAuth token exchange failed:', error);
      return new Response(undefined, {
        status: 500,
      });
    });
};
