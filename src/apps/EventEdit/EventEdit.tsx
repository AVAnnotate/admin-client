import { EventForm } from "@components/EventForm/EventForm.tsx";
import type { Event, Translations } from "@ty/Types.ts";
import type React from "react";

import './EventEdit.css'

interface Props {
  event: Event;
  i18n: Translations;
}

export const EventEdit: React.FC<Props> = ({ event, i18n }) => {
  const { t } = i18n;

  return (
    <div className="event-edit-form">
      <EventForm event={event} title={t['Edit Event']} i18n={i18n} />
    </div>
  )
}
