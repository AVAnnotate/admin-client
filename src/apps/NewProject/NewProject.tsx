import type { Project, ProviderUser, Translations } from '@ty/Types.ts';
import { Sidebar, type SidebarSelection } from './Sidebar/index.ts';
import { useState } from 'react';
import { ProjectForm } from './ProjectForm/index.ts';

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
            onSave={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
