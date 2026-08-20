import type { AstroCookies } from 'astro';
import type { UserInfo } from '@ty/Types.ts';

export const userInfo = async (
  cookies: AstroCookies
): Promise<UserInfo | undefined> => {
  const tokenCookie = cookies.get('access-token');

  if (tokenCookie) {
    console.info('[GitHub user] requesting authenticated profile');
    const token = tokenCookie.value;
    let response: Response;

    try {
      response = await fetch(`https://api.github.com/user`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    } catch (error) {
      console.error('[GitHub user] profile request failed', error);
      throw error;
    }

    console.info(
      `[GitHub user] profile response; status=${response.status}; requestId=${
        response.headers.get('x-github-request-id') ?? 'unavailable'
      }`
    );

    // Do not treat an expired, rejected, or malformed token as a logged-in
    // user. GitHub error responses do not contain profile fields, which used
    // to produce a blank avatar and empty repository/organization lists.
    if (!response.ok) {
      console.error(
        `[GitHub user] profile rejected; status=${response.status}; rateLimitRemaining=${
          response.headers.get('x-ratelimit-remaining') ?? 'unavailable'
        }`
      );
      return undefined;
    }

    const user = await response.json();
    console.info(`[GitHub user] profile loaded; login=${user.login}`);

    return {
      profile: {
        gitHubName: user.login,
        name: user.name,
        avatarURL: user.avatar_url,
        email: user.email,
      },
      token: token,
    };
  }

  console.info('[GitHub user] profile request skipped: access-token cookie missing');
};
