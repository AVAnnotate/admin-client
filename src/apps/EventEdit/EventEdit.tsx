import { EventForm } from "@components/EventForm/EventForm.tsx";
import type { Event, ProjectData, Translations } from "@ty/Types.ts";
import type React from "react";

import './EventEdit.css'
import { Breadcrumbs } from "@components/Breadcrumbs/Breadcrumbs.tsx";

interface Props {
  event: Event;
  i18n: Translations;
  project: ProjectData;
}

export const EventEdit: React.FC<Props> = ({ event, i18n, project }) => {
  const { t, lang } = i18n;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          { label: project.project.title, link: `/${lang}/projects/${project.project.gitHubOrg}+${project.project.slug}` },
          { label: t['Edit Event'], link: '' }
        ]}
      />
      <div className="event-edit-form">
        <EventForm event={event} title={t['Edit Event']} i18n={i18n} />
      </div>
    </>
  )
}
