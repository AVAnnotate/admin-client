import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const logContext = `[GitHub OAuth] callback host=${requestUrl.host}`;

  console.info(`${logContext} received; codePresent=${Boolean(code)}`);

  if (!code) {
    console.error(`${logContext} rejected: authorization code is missing`);
    return new Response(undefined, { status: 400 });
  }

  const data = new FormData();
  data.append('client_id', import.meta.env.PUBLIC_GITHUB_CLIENT_ID);
  data.append('client_secret', import.meta.env.GITHUB_CLIENT_SECRET);
  data.append('code', code);

  try {
    // Never log the authorization code, client secret, or returned token.
    console.info(`${logContext} exchanging authorization code`);
    const response = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      body: data,
    });
    const paramsString = await response.text();
    console.info(
      `${logContext} token endpoint responded; status=${response.status}`
    );

    const params = new URLSearchParams(paramsString);
    const access_token = params.get('access_token');

    if (!access_token) {
      console.error(
        `${logContext} token exchange failed; error=`,
        params.get('error_description') ?? params.get('error') ?? 'unknown error'
      );
      return new Response(undefined, { status: 401 });
    }

    const secure = requestUrl.protocol === 'https:' ? '; Secure' : '';
    const headers = new Headers({
      Location: `${requestUrl.origin}/en/projects`,
    });
    headers.append(
      'Set-Cookie',
      `access-token=${access_token}; HttpOnly; SameSite=Lax; Path=/${secure}`
    );
    // A regular GitHub login must not inherit an enterprise provider marker
    // from an earlier login in the same browser.
    headers.append(
      'Set-Cookie',
      `auth-provider=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
    );

    console.info(`${logContext} session created; redirect=/en/projects`);
    return new Response(undefined, { status: 302, headers });
  } catch (error) {
    console.error(`${logContext} token exchange request failed`, error);
    return new Response(undefined, { status: 500 });
  }
};
