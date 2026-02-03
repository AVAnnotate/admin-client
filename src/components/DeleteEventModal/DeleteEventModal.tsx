import type { Annotation, Page, Translations } from '@ty/Types.ts';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { DeleteModal } from '@components/DeleteModal/DeleteModal.tsx';
import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import './DeleteEventModal.css';
import { ProjectContext } from '@apps/Project/ProjectContext.ts';

interface Props {
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  onAfterSave: () => void;
  onCancel: () => void;
}

export const DeleteEventModal: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  const { project } = useContext(ProjectContext);

  const pages = useMemo(() => project?.pages, [project]);
  const annotations = useMemo(() => project?.annotations, [project]);

  const eventIsParent = useCallback(
    (uuid: string, pages?: { [key: string]: Page }) => {
      if (!pages) {
        return false;
      }
      //the passed uuid is an event, so we need to see if there's an associated page
      const eventPages = Object.keys(pages)?.filter((key) => {
        const page = pages[key];
        return (
          page &&
          page.autogenerate &&
          page.autogenerate.enabled &&
          page.autogenerate.type === 'event' &&
          page.autogenerate.type_id === uuid
        );
      });
      if (!eventPages?.length) {
        return false;
      }
      return !!Object.values(pages)?.find(
        (page) => page?.parent && eventPages.includes(page.parent)
      );
    },
    []
  );

  const isParent = useMemo(
    () => eventIsParent(props.eventUuid, pages),
    [eventIsParent, props.eventUuid, pages]
  );

  if (isParent) {
    return (
      <>
        <AlertDialog.Root open>
          <AlertDialog.Content className='delete-modal'>
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
    const annoFileUuids = annotations
      ? Object.keys(annotations).filter(
          (uuid) => annotations[uuid].event_id === props.eventUuid
        )
      : [];

    const count = annoFileUuids.reduce(
      (acc, uuid) =>
        annotations ? acc + annotations[uuid].annotations.length : 0,
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
  }, [annotations, props.eventUuid]);

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
