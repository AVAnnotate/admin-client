import { AlertDialog } from '@radix-ui/themes';
import './DeleteEventModal.css';
import type { Annotation, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';

interface Props {
  i18n: Translations;
  eventUuid: string;
  annotations: { [key: string]: Annotation };
}

export const DeleteEventModal: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  // get a count of the number of annotations that will be deleted
  // alongside this event.
  const annoCount = useMemo(() => {
    const annoFileUuids = Object.keys(props.annotations).filter(
      (uuid) => props.annotations[uuid].event_id === props.eventUuid
    );
    const count = annoFileUuids.reduce(
      (acc, uuid) => acc + props.annotations[uuid].annotations.length,
      0
    );

    return count;
  }, [props.annotations, props.eventUuid]);

  return (
    <AlertDialog.Root>
      <AlertDialog.Content>
        <AlertDialog.Title>{t['Delete Event']}</AlertDialog.Title>
        <AlertDialog.Description>
          {t['Are you sure you want to delete this event?']}
          {annoCount > 0
            ? ` ${annoCount} ${t['associated annotations will be deleted.']}`
            : null}
        </AlertDialog.Description>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
