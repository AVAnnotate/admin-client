import { Breadcrumbs } from "@components/Breadcrumbs/index.ts";
import { EventForm } from "@components/EventForm/index.ts";
import { ToggleInput } from "@components/Formic/index.tsx";
import { Button } from "@radix-ui/themes";
import type { Event, ProjectData, Translations } from "@ty/Types.ts";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import './NewEvent.css'
import { ImportForm } from "@components/ImportForm/ImportForm.tsx";

interface Props {
  i18n: Translations;
  project: ProjectData;
}

export const NewEvent: React.FC<Props> = ({ i18n, project }) => {
  const [tab, setTab] = useState(0);

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
        <h1>{t['Add Event']}</h1>
        <p>{t['Choose to create a new manifest or import an existing one.']}</p>
        <div className="manifest-toggle">
          <Button
            className={`create-manifest-button ${tab === 0 ? 'primary' : 'outline'}`}
            data-selected={true}
            onClick={() => setTab(0)}
          >
            {t['Create manifest']}
          </Button>
          <Button
            className={`import-manifest-button ${tab === 1 ? 'primary' : 'outline'}`}
            onClick={() => setTab(1)}
          >
            {t['Import manifest']}
          </Button>
        </div>
        <EventForm
          i18n={i18n}
          onSubmit={onSubmit}
          styles={{ display: tab === 0 ? 'initial' : 'none' }}
        >
          <ToggleInput
            helperText={t['lorem']}
            label={t['Auto-generate web page for this event?']}
            name='auto_generate_web_page'
          />
        </EventForm>
        <ImportForm
          i18n={i18n}
          onSubmit={() => console.log('work in progress!')}
          styles={{ display: tab === 1 ? 'initial' : 'none' }}
        />
      </div>
    </>
  )
}
