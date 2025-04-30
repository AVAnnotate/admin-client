import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { Button, Theme } from '@radix-ui/themes';
import type { FormEvent, ProjectData, Translations } from '@ty/Types.ts';
import type React from 'react';
import { useCallback, useState } from 'react';
import './NewEvent.css';
import { ImportManifest } from '@components/ImportManifest/ImportManifest.tsx';
import { NewEventForm } from '@components/EventForm/NewEventForm.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const NewEvent: React.FC<Props> = ({ i18n, project, projectSlug }) => {
  const [tab, setTab] = useState(0);

  const { t, lang } = i18n;

  const onSubmit = useCallback(async (newEvent: FormEvent) => {
    await fetch(`/api/projects/${projectSlug}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: newEvent }),
    });

    window.location.pathname = `/${lang}/projects/${projectSlug}`;
  }, []);

  return (
    <div className='new-event-container'>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: project.project.title,
            link: `/${lang}/projects/${projectSlug}`,
          },
          { label: t['Add Event'], link: '' },
        ]}
      />
      <div className='container'>
        <h1>{t['Add Event']}</h1>
        <p>{t['Choose to create a new manifest or import an existing one.']}</p>
        <div className='manifest-toggle'>
          <Button
            className={`create-manifest-button ${
              tab === 0 ? 'primary' : 'outline'
            }`}
            data-selected={true}
            onClick={() => setTab(0)}
          >
            {t['Create manifest']}
          </Button>
          <Button
            className={`import-manifest-button ${
              tab === 1 ? 'primary' : 'outline'
            }`}
            onClick={() => setTab(1)}
          >
            {t['Import manifest']}
          </Button>
        </div>
        <Theme>
          <NewEventForm
            i18n={i18n}
            onSubmit={onSubmit}
            styles={{ display: tab === 0 ? 'initial' : 'none' }}
            project={project}
            projectSlug={projectSlug}
            uuid={''}
          />

          {tab === 1 && (
            <ImportManifest i18n={i18n} projectSlug={projectSlug} />
          )}
        </Theme>
      </div>
    </div>
  );
};
