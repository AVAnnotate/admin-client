import { Breadcrumbs } from "@components/Breadcrumbs/index.ts";
import { EventForm } from "@components/EventForm/index.ts";
import type { Event, ProjectData, Translations } from "@ty/Types.ts";
import type React from "react";
import { useCallback, useMemo } from "react";

interface Props {
  i18n: Translations;
  project: ProjectData;
}

export const NewEvent: React.FC<Props> = ({ i18n, project }) => {
  const { t, lang } = i18n;

  const projectSlug = useMemo(() => `${project.project.gitHubOrg}+${project.project.slug}`, [project])

  const onSubmit = useCallback(async (newEvent: Event) => {
    const res = await fetch(`/api/projects/${projectSlug}/events/new`, {
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
          { label: t['Add Event'], link: '' }
        ]}
      />
      <div className="container">
        <EventForm title={t['Add Event']} i18n={i18n} onSubmit={onSubmit} />
      </div>
    </>
  )
}
