import React, { useMemo, useState } from 'react';
import './EventList.css';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { PlusIcon, DownloadIcon } from '@radix-ui/react-icons';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import type { DraggedPage } from '@ty/ui.ts';
import { EventRow } from './EventRow.tsx';
import { DropdownButton } from '@components/DropdownButton/DropdownButton.tsx';
import { exportEvents } from '@lib/events/export.ts';
import { EmptyDashboard } from '@components/EmptyDashboard/EmptyDashboards.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;

  onDelete(eventId: string): void;
}

export const EventList: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const [eventOrder, setEventOrder] = useState(props.project.eventOrder);
  const [project, setProject] = useState(props.project);

  const { t } = props.i18n;

  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  const isChanged = useMemo(
    () => eventOrder !== props.project.eventOrder,
    [props.project.eventOrder, eventOrder]
  );

  const onDrop = async () => {
    if (pickedUp) {
      // ignore if we're dropping in the same spot it came from
      if (pickedUp.hoverIndex === pickedUp.originalIndex) {
        return setPickedUp(null);
      }

      const selectedPage = project.pages![pickedUp.uuid];

      let newArray = eventOrder!.filter((k) => k !== pickedUp.uuid);

      if (selectedPage.parent) {
        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid);
      } else {
        const children = eventOrder!.filter(
          (key) => project.pages![key].parent === pickedUp.uuid
        );

        newArray = newArray.filter((k) => !children.includes(k));

        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid, ...children);
      }

      setEventOrder(newArray);
    }
  };

  const onSubmit = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${props.projectSlug}/events/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: eventOrder }),
    });

    const data = await res.json();

    setEventOrder(data.order);
    setSaving(false);
  };

  return (
    <>
      {saving && <LoadingOverlay />}
      <div className='event-list'>
        <div className='event-list-top-bar'>
          <Button
            className='csv-button'
            onClick={() =>
              exportEvents(
                props.project.project.title,
                Object.keys(props.project.events).map(
                  (k) => props.project.events[k]
                )
              )
            }
            type='button'
          >
            <DownloadIcon />
            {t['CSV']}
          </Button>
          <DropdownButton
            title={t['Add Event']}
            titleIcon={<PlusIcon />}
            items={[
              {
                icon: <PlusIcon />,
                label: t['Add single event'],
                onClick: () =>
                  (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/new`),
              },
              {
                icon: <FileEarmarkArrowUp />,
                label: t['Import multiple from file'],
                onClick: () =>
                  (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/import`),
              },
            ]}
          />
        </div>
        {eventOrder && eventOrder?.length > 0 && (
          <div className='event-list-box-container'>
            {eventOrder!.map((uuid, idx) => (
              <EventRow
                project={project}
                uuid={uuid}
                index={idx}
                pickedUp={pickedUp}
                setPickedUp={setPickedUp}
                i18n={props.i18n}
                onDrop={onDrop}
                key={uuid}
                onDelete={props.onDelete}
              />
            ))}
          </div>
        )}
        {eventOrder && eventOrder.length > 0 ? (
          <BottomBar>
            <div className='event-list-bottom-bar'>
              <Button
                className='primary'
                disabled={!isChanged}
                onClick={onSubmit}
              >
                {t['save']}
              </Button>
            </div>
          </BottomBar>
        ) : (
          <EmptyDashboard description={t['No events have been added']}>
            <Button
              className='button primary'
              onClick={() =>
                exportEvents(
                  props.project.project.title,
                  Object.keys(props.project.events).map(
                    (k) => props.project.events[k]
                  )
                )
              }
              type='button'
            >
              <DownloadIcon />
              {t['CSV']}
            </Button>
          </EmptyDashboard>
        )}
      </div>
    </>
  );
};
