import { EventForm } from "@components/EventForm/index.ts";
import type { Event, ProjectData, Translations } from "@ty/Types.ts";
import type React from "react";

import './EventEdit.css'
import { Breadcrumbs } from "@components/Breadcrumbs/Breadcrumbs.tsx";
import { useCallback, useMemo } from "react";

interface Props {
  event: Event;
  i18n: Translations;
  project: ProjectData;
}

export const EventEdit: React.FC<Props> = ({ event, i18n, project }) => {
  const { t, lang } = i18n;

  const projectSlug = useMemo(() => `${project.project.gitHubOrg}+${project.project.slug}`, [project])

  const onSubmit = useCallback(async (newEvent: Event) => {
    const res = await fetch(`/api/projects/${projectSlug}/events/${event.uuid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })

    window.location.pathname = `/${lang}/projects/${projectSlug}`
  }, [])

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          { label: project.project.title, link: `/${lang}/projects/${projectSlug}` },
          { label: t['Edit Event'], link: '' }
        ]}
      />
      <div className="container">
        <h1>{t['Edit Event']}</h1>
        <EventForm event={event} i18n={i18n} onSubmit={onSubmit} />
      </div>
    </>
  )
}
