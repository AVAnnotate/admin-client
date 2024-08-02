import { AlertDialog, Button, Flex, Spinner } from '@radix-ui/themes';
import './DeleteEventModal.css';
import type { Annotation, Translations } from '@ty/Types.ts';
import { useMemo, useState } from 'react';
import { Trash } from 'react-bootstrap-icons';

interface Props {
  annotations: { [key: string]: Annotation };
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  onAfterSave: () => void;
  onCancel: () => void;
}

export const DeleteEventModal: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);

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

  const deletePath = useMemo(
    () => `/api/projects/${props.projectSlug}/events/${props.eventUuid}`,
    [props.eventUuid, props.projectSlug]
  );

  const deleteEvent = async () => {
    setLoading(true);

    await fetch(deletePath, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    props.onAfterSave();
  };

  return (
    <AlertDialog.Root open>
      <AlertDialog.Content className='delete-event-modal'>
        {loading && <Spinner />}
        <AlertDialog.Title>{t['Delete Event']}</AlertDialog.Title>
        <AlertDialog.Description>
          <p>{t['Are you sure you want to delete this event?']}</p>

          {annoCount > 0 ? (
            <p className='annotation-note'>
              <span className='annotation-count'>{annoCount}</span>
              &nbsp;
              {t['associated annotations will also be deleted.']}
            </p>
          ) : null}
        </AlertDialog.Description>
        <Flex gap='3' mt='4' justify='end'>
          <AlertDialog.Cancel onClick={props.onCancel}>
            <Button className='unstyled delete-event-button cancel-button'>
              {t['cancel']}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={async () => await deleteEvent()}>
            <Button className='unstyled delete-event-button delete-button'>
              <Trash />
              <span>{t['Delete']}</span>
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
