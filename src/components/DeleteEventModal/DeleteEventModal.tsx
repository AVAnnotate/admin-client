import type { Annotation, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';
import { DeleteModal } from '@components/DeleteModal/DeleteModal.tsx';
import './DeleteEventModal.css';

interface Props {
  annotations: { [key: string]: Annotation };
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  onAfterSave: () => void;
  onCancel: () => void;
}

export const DeleteEventModal: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  // get a count of the number of annotations that will be deleted
  // alongside this event.
  const warningText = useMemo(() => {
    const annoFileUuids = Object.keys(props.annotations).filter(
      (uuid) => props.annotations[uuid].event_id === props.eventUuid
    );

    const count = annoFileUuids.reduce(
      (acc, uuid) => acc + props.annotations[uuid].annotations.length,
      0
    );

    if (count === 0) {
      return undefined;
    } else {
      return (
        <p className='annotation-note'>
          <span className='annotation-count'>{count}</span>
          &nbsp;
          {t['associated annotations will also be deleted.']}
        </p>
      );
    }
  }, [props.annotations, props.eventUuid]);

  const deletePath = useMemo(
    () => `/api/projects/${props.projectSlug}/events/${props.eventUuid}`,
    [props.eventUuid, props.projectSlug]
  );

  const deleteEvent = async () => {
    await fetch(deletePath, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    props.onAfterSave();
  };

  return (
    <DeleteModal
      additionalText={warningText}
      className='delete-event-modal'
      name={t['Event']}
      i18n={props.i18n}
      onCancel={props.onCancel}
      onDelete={deleteEvent}
    />
  );
};
