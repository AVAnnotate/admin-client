import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import type { ProjectData, Translations, UserInfo } from '@ty/Types.ts';
import './ProjectSettings.css';
import { Sidebar } from '@components/Sidebar/Sidebar.tsx';
import { useState } from 'react';
import { EditProjectForm } from '@components/ProjectForm/EditProjectForm.tsx';
import type { apiProjectPut } from '@ty/api.ts';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
  userInfo: UserInfo;
}

type Tabs = 'general' | 'users';

export const ProjectSettings: React.FC<Props> = (props) => {
  const [tab, setTab] = useState<Tabs>('general');
  const { lang, t } = props.i18n;
  const [saving, setSaving] = useState(false);

  const handleSaveProject = (formData: apiProjectPut) => {
    setSaving(true);

    fetch(`/api/projects/${props.projectSlug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then(() => {
      setSaving(false);
      window.location.pathname = `/${lang}/projects/${props.projectSlug}`;
    });
  };

  const isOwner =
    props.project.project.creator === props.userInfo.profile.gitHubName;

  return (
    <>
      {saving && <LoadingOverlay />}
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Settings'], link: '' },
        ]}
      />
      <div className='project-settings-container'>
        <h2>{t['Settings']}</h2>
        <div className='project-settings-form-container'>
          <div className='project-settings-sidebar'>
            <Sidebar
              selection={tab}
              onSelect={(newTab) => setTab(newTab as Tabs)}
              tabs={
                isOwner
                  ? [
                      {
                        name: 'general',
                        label: t['General'],
                      },
                      {
                        name: 'users',
                        label: t['Users'],
                      },
                    ]
                  : [
                      {
                        name: 'general',
                        label: t['General'],
                      },
                    ]
              }
            />
          </div>
          <div className='project-settings-form'>
            <EditProjectForm
              selection={tab}
              projectData={props.project}
              projectSlug={props.projectSlug}
              i18n={props.i18n}
              onSave={(data) => handleSaveProject(data)}
              userInfo={props.userInfo}
            />
          </div>
        </div>
      </div>
    </>
  );
};
