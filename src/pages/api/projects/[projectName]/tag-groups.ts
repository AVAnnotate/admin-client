import type { APIRoute } from 'astro';
import type {
  apiAddTagGroup,
  apiUpdateTagGroup,
  apiDeleteTagGroup,
} from '@ty/api.ts';
import { userInfo } from '@backend/userInfo.ts';
import { parseSlug } from '@backend/projectHelpers.ts';
import type { ProjectData, UserInfo } from '@ty/Types.ts';
import {
  createTagGroup,
  deleteTagGroup,
  updateTagGroup,
} from '@backend/tagHelpers.ts';

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

    const body: apiAddTagGroup = await request.json();

    // add the group
    const ret: ProjectData | undefined = await createTagGroup(
      repoUrl,
      info as UserInfo,
      body.tagGroup
    );

    if (ret) {
      return new Response(
        JSON.stringify({
          project: ret,
        })
      );
    } else {
      return new Response(null, {
        status: 500,
        statusText: 'Failed to create Tag Group: ' + body.tagGroup.category,
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

    const body: apiUpdateTagGroup = await request.json();

    // add the group
    const ret: ProjectData | undefined = await updateTagGroup(
      repoUrl,
      info as UserInfo,
      body.oldTagGroup,
      body.newTagGroup
    );

    if (ret) {
      return new Response(
        JSON.stringify({
          project: ret,
        }),
        { status: 200 }
      );
    } else {
      return new Response(null, {
        status: 500,
        statusText: 'Failed to update Tag Group: ' + body.oldTagGroup.category,
      });
    }
  }

  return new Response(null, {
    status: 400,
    statusText: 'Must be JSON data',
  });
};

export const DELETE: APIRoute = async ({
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

    const body: apiDeleteTagGroup = await request.json();

    if (body.tagGroup.category !== '_uncategorized_') {
      // delete the group
      const ret: ProjectData | undefined = await deleteTagGroup(
        repoUrl,
        info as UserInfo,
        body.tagGroup
      );

      if (ret) {
        return new Response(
          JSON.stringify({
            project: ret,
          })
        );
      } else {
        return new Response(null, {
          status: 500,
          statusText: 'Failed to delete Tag Group: ' + body.tagGroup.category,
        });
      }
    } else {
      return new Response(null, {
        status: 400,
        statusText: 'Cannot delete the Uncategorized group: ',
      });
    }
  }

  return new Response(null, {
    status: 400,
    statusText: 'Must be JSON data',
  });
};
