import type { APIRoute } from 'astro';
import type { apiAddTag, apiUpdateTag } from '@ty/api.ts';
import { userInfo } from '@backend/userInfo.ts';
import { parseSlug } from '@backend/projectHelpers.ts';
import type { ProjectData, UserInfo } from '@ty/Types.ts';
import { addTag, updateTag } from '@backend/tagHelpers.ts';

export const POST: APIRoute = async ({
  cookies,
  params,
  request,
  redirect,
}) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const token = cookies.get('access-token');

    // Get the user info
    const info = await userInfo(cookies);

    // Get params
    const { projectName } = params;

    const { org, repo } = parseSlug(projectName as string);

    const baseUrl = 'https://github.com';
    const repoUrl = `${baseUrl}/${org}/${repo}`;
    if (!token || !info) {
      redirect('/', 307);
    }

    const body: apiAddTag = await request.json();

    const project: ProjectData | undefined = await addTag(
      repoUrl,
      info as UserInfo,
      body.tag
    );

    if (project) {
      return new Response(
        JSON.stringify({
          project,
        })
      );
    } else {
      return new Response(null, {
        status: 500,
        statusText: 'Failed to create Tag: ' + body.tag.tag,
      });
    }
  }
  return new Response(null, {
    status: 400,
    statusText: 'Must be JSON data',
  });
};

export const PUT: APIRoute = async ({ cookies, params, request, redirect }) => {
  if (request.headers.get('Content-Type') === 'application/json') {
    const token = cookies.get('access-token');

    // Get the user info
    const info = await userInfo(cookies);

    // Get params
    const { projectName } = params;

    const { org, repo } = parseSlug(projectName as string);

    const baseUrl = 'https://github.com';
    const repoUrl = `${baseUrl}/${org}/${repo}`;
    if (!token || !info) {
      redirect('/', 307);
    }

    const body: apiUpdateTag = await request.json();

    const project: ProjectData | undefined = await updateTag(
      repoUrl,
      info as UserInfo,
      body.oldTag,
      body.newTag
    );

    if (project) {
      return new Response(
        JSON.stringify({
          project,
        })
      );
    } else {
      return new Response(null, {
        status: 500,
        statusText: 'Failed to update Tag: ' + body.newTag,
      });
    }
  }
  return new Response(null, {
    status: 400,
    statusText: 'Must be JSON data',
  });
};
