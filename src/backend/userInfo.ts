import type { AstroCookies } from 'astro';
import type { UserInfo } from 'src/Types';

export const userInfo = async (
  cookies: AstroCookies
): Promise<UserInfo | undefined> => {
  const tokenCookie = cookies.get('access-token');

  if (tokenCookie) {
    const token = tokenCookie.value;
    const response = await fetch(`https://api.github.com/user`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const user = await response.json();

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
};
