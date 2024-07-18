import type {
  GitHubOrganization,
  Project,
  ProviderUser,
  Translations,
} from '@ty/Types.ts';
import { Sidebar, type SidebarSelection } from './Sidebar/index.ts';
import { useState } from 'react';
import { ProjectForm } from './ProjectForm/index.ts';
import type { apiProjectsProjectNamePost } from '@ty/api.ts';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { mapTagData } from '@lib/parse/index.ts';

import './NewProject.css';

interface NewProjectProps {
  project?: Project;

  i18n: Translations;

  orgs: GitHubOrganization[];

  onSave(project: Project): void;
}

export const NewProject = (props: NewProjectProps) => {
  const [selection, setSelection] = useState<SidebarSelection>('general');
  const [saving, setSaving] = useState(false);

  const { t, lang } = props.i18n;

  const handleSaveProject = (
    project: Project,
    map: { [key: string]: number }
  ) => {
    setSaving(true);

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
      visibility: 'public',
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
    }).then((result) => {
      setSaving(false);
      window.location.pathname = `/${lang}/projects`;
    });
  };

  return (
    <div className='new-project-container container'>
      {saving && <LoadingOverlay />}
      <h1>{t['Create New Project']}</h1>
      <div className='new-project-panes'>
        <Sidebar
          selection={selection}
          i18n={props.i18n}
          onSelect={setSelection}
        />
        <div className='new-project-form-container'>
          <ProjectForm
            i18n={props.i18n}
            onSave={handleSaveProject}
            orgs={props.orgs}
            selection={selection}
          />
        </div>
      </div>
    </div>
  );
};
