import type { GitHubOrganization, Project, Translations } from '@ty/Types.ts';
import { useState } from 'react';
import { NewProjectForm } from '../../components/ProjectForm/index.ts';
import type { apiProjectsProjectNamePost } from '@ty/api.ts';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { mapTagData } from '@lib/parse/index.ts';
import { avaError } from '../../nanos/error.ts';
import { SideTabScrollingContainer } from '@components/SideTabScrollingContainer/SideTabScrollingContainer.tsx';

import './NewProject.css';

interface NewProjectProps {
  project?: Project;

  i18n: Translations;

  orgs: GitHubOrganization[];

  onSave(project: Project): void;
}

export const NewProject = (props: NewProjectProps) => {
  const [selection, setSelection] = useState<string>('general');
  const [saving, setSaving] = useState(false);

  const { t, lang } = props.i18n;

  const handleSaveProject = (
    project: Project,
    map: { [key: string]: number }
  ) => {
    setSaving(true);
    avaError.set('');

    const body: apiProjectsProjectNamePost = {
      templateRepo: import.meta.env.PUBLIC_GIT_REPO_PROJECT_TEMPLATE,
      gitHubOrg: project.github_org,
      description: project.description,
      title: project.title,
      slug: project.slug,
      projectDescription: project.description,
      projectAuthors: project.authors,
      mediaPlayer: project.media_player,
      additionalUsers: project.additional_users.map((u) => u.login_name),
      language: project.language,
      autoPopulateHomePage: project.auto_populate_home_page,
      visibility: project.is_private ? 'private' : 'public',
      generate_pages_site: !!project.generate_pages_site,
      tags: project.tags
        ? // @ts-ignore
          mapTagData(project!.tags.data, map)
        : undefined,
    };

    fetch(`/api/projects/${project.slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((resp: Response) => {
      setSaving(false);
      if (resp.ok) {
        window.location.pathname = `/${lang}/projects/${project.github_org}+${project.slug}`;
      } else {
        resp.json().then((body) => avaError.set(t[body.avaError]));
      }
    });
  };

  return (
    <div className='new-project-container container'>
      {saving && <LoadingOverlay />}
      <NewProjectForm
        i18n={props.i18n}
        onSave={handleSaveProject}
        orgs={props.orgs}
        selection={selection}
      />
    </div>
  );
};
