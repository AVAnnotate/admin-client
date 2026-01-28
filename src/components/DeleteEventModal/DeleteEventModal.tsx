import type { Annotation, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';
import { DeleteModal } from '@components/DeleteModal/DeleteModal.tsx';
import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import './DeleteEventModal.css';

interface Props {
  annotations: { [key: string]: Annotation };
  eventUuid: string;
  i18n: Translations;
  eventIsParent?: Boolean;
  projectSlug: string;
  onAfterSave: () => void;
  onCancel: () => void;
}

export const DeleteEventModal: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  if (props.eventIsParent) {
    return (
      <>
        <AlertDialog.Root open>
          <AlertDialog.Content>
            <div className='content-container'>
              <div className='text-container'>
                <AlertDialog.Title>{`${t['Delete']} ${t['Event']}`}</AlertDialog.Title>
                <AlertDialog.Description className='alert-description'>
                  {t['Event cannot be deleted.']}
                </AlertDialog.Description>
                <p>
                  {
                    t[
                      'This event is associated with a page that has subpages. Remove any subpages and try again.'
                    ]
                  }
                </p>
                <Flex gap='3' mt='4' justify='end' className='bottom-bar'>
                  <AlertDialog.Cancel onClick={props.onCancel}>
                    <Button className='unstyled delete-modal-button cancel-button'>
                      {t['cancel']}
                    </Button>
                  </AlertDialog.Cancel>
                </Flex>
              </div>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </>
    );
  }

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
