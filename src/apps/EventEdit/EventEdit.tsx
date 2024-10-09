import { EventForm } from '@components/EventForm/index.ts';
import type {
  Annotation,
  Event,
  FormEvent,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import type React from 'react';

import './EventEdit.css';
import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import { useCallback, useMemo } from 'react';

interface Props {
  event: Event;
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
  uuid: string;
}

export const EventEdit: React.FC<Props> = ({
  event,
  uuid,
  i18n,
  project,
  projectSlug,
}) => {
  const { t, lang } = i18n;

  const annotationSets = useMemo(() => {
    const ret: { value: string; label: string }[] = [];
    if (project && project.annotations) {
      for (let key of Object.keys(project.annotations)) {
        const anno = project.annotations[key];
        for (let key2 of Object.keys(event.audiovisual_files)) {
          if (anno.source_id === key2) {
            ret.push({ value: key, label: anno.set });
          }
        }
      }
    }

    return ret;
  }, [project]);

  const onSubmit = useCallback(async (newEvent: Event | FormEvent) => {
    await fetch(`/api/projects/${projectSlug}/events/${uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: newEvent }),
    });

    window.location.pathname = `/${lang}/projects/${projectSlug}`;
  }, []);

  return (
    <div className='event-edit-container'>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: project.project.title,
            link: `/${lang}/projects/${projectSlug}`,
          },
          { label: t['Edit Event'], link: '' },
        ]}
      />
      <div className='container'>
        <h1>{t['Edit Event']}</h1>
        <EventForm
          event={event}
          i18n={i18n}
          onSubmit={onSubmit}
          annotationSetList={annotationSets}
        />
      </div>
    </div>
  );
};
