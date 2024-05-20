import type { Project, ProviderUser, Translations } from '@ty/Types.ts';
import { Sidebar, type SidebarSelection } from './Sidebar/index.ts';
import { useState } from 'react';
import { ProjectForm } from './ProjectForm/index.ts';
import type { apiProjectsProjectNamePost } from '@ty/api.ts';

import './NewProject.css';

interface NewProjectProps {
  project?: Project;

  i18n: Translations;

  allUsers: ProviderUser[];

  onSave(project: Project): void;
}

export const NewProject = (props: NewProjectProps) => {
  const [selection, setSelection] = useState<SidebarSelection>('general');

  const { t } = props.i18n;

  const handleSaveProject = (project: Project) => {
    const body: apiProjectsProjectNamePost = {
      templateRepo: import.meta.env.PUBLIC_GIT_REPO_PROJECT_TEMPLATE,
      description: project.description,
      title: project.title,
      slug: project.slug,
      projectDescription: project.description,
      projectAuthors: project.authors,
      mediaPlayer: project.mediaPlayer,
      additionalUsers: project.additionalUsers.map((u) => u.loginName),
      language: project.language,
      autoPopulateHomePage: project.autoPopulateHomePage,
      visibility: 'public',
    };

    fetch(`/api/projects/${project.slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((result) => console.log('Result: ', result));
  };

  return (
    <div className='new-project-container'>
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
            allUsers={props.allUsers}
            onSave={handleSaveProject}
          />
        </div>
      </div>
    </div>
  );
};
