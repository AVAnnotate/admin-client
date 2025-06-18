import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { useEffect, useMemo, useRef, useState } from 'react';
import Tabs from './Tabs.tsx';
import AvFile from './AvFile.tsx';
import './styles.css';
import { DeleteEventModal } from '@components/DeleteEventModal/index.ts';
import { Video } from '@phosphor-icons/react/Video';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThree } from '@phosphor-icons/react/dist/icons/DotsThree';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { Button } from '@radix-ui/themes';
import useExpandHeight from 'src/hooks/useExpandHeight.tsx';

interface EventDetailProps {
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

export const EventDetail: React.FC<EventDetailProps> = (props) => {
  const { t, lang } = props.i18n;

  const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);

  const tabs = useMemo(() => {
    const uuids = Object.keys(props.event.audiovisual_files);
    const isSingleAvFile = uuids.length === 1;

    return uuids.map((uuid, index) => {
      const avFileObj = props.event.audiovisual_files[uuid];

      return {
        uuid,
        title: isSingleAvFile
          ? avFileObj.label
          : `${index + 1}. ${avFileObj.label}`,
      };
    });
  }, []);

  const [tab, setTab] = useState(tabs[0]);

  const sets = useMemo(() => {
    const setsSort = props.event.audiovisual_files[tab.uuid].set_sort;

    return setsSort && setsSort.length > 0
      ? setsSort
      : Object.keys(props.project.annotations).filter((uuid) => {
          const setObj = props.project.annotations[uuid];

          return (
            setObj.event_id === props.eventUuid && setObj.source_id === tab.uuid
          );
        });
  }, [tab, props.project.annotations]);

  const baseUrl = useMemo(
    () => `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}`,
    [props.projectSlug, props.eventUuid]
  );

  const avFile = useMemo(
    () => props.event.audiovisual_files[tab.uuid],
    [tab.uuid, props.event.audiovisual_files]
  );

  const fileType = useMemo(
    () => avFile.file_type || props.event.item_type || 'Audio',
    [avFile, props.event.item_type]
  );

  const videoEventDetailTabRef = useRef(null);

  useExpandHeight(videoEventDetailTabRef);

  return (
    <>
      <div className='breadcrumbs-container'>
        <Breadcrumbs
          items={[
            { label: t['Projects'], link: `/${lang}/projects` },
            {
              label: props.project.project.title,
              link: `/${lang}/projects/${props.projectSlug}`,
            },
            {
              label: props.event.label,
            },
          ]}
        />
      </div>
      <div className='event-detail'>
        <div className='event-title-container'>
          <div className='container'>
            <h1 className='event-title'>{props.event.label}</h1>
            <Dropdown.Root modal={false}>
              <Dropdown.Trigger asChild>
                <Button className='meatball-menu-button unstyled' type='button'>
                  <DotsThree size={30} color='white' />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Portal>
                <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
                  <Dropdown.Item className='dropdown-item'>
                    <a href={`${baseUrl}/edit`} className='unstyled'>
                      <PencilSquare color='black' />
                      {t['Edit Event']}
                    </a>
                  </Dropdown.Item>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => setShowEventDeleteModal(true)}
                  >
                    <Trash color='red' />
                    {t['Delete Event']}
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown.Portal>
            </Dropdown.Root>
          </div>
        </div>
        <div className='tab-container container'>
          {tabs.length > 1 && (
            <Tabs
              currentTab={tab}
              tabs={tabs}
              setTab={setTab}
              renderIcon={(item) => {
                const file = props.event.audiovisual_files[item.uuid];

                if (file.file_type === 'Video') {
                  return <Video color='black' />;
                }

                return <SpeakerLoudIcon color='black' />;
              }}
            />
          )}
        </div>
        {fileType === 'Audio' && (
          <div className='audio-event-detail-tab event-detail-tab-content'>
            <div className='container'>
              <AvFile
                avFile={avFile}
                i18n={props.i18n}
                fileType={fileType}
                key={tab.uuid}
                project={props.project}
                projectSlug={props.projectSlug}
                sets={sets}
                title={tab.title}
                uuid={tab.uuid}
                eventUuid={props.eventUuid}
                event={props.event}
              />
            </div>
          </div>
        )}
        {fileType === 'Video' && (
          <div className='video-event-detail-tab' ref={videoEventDetailTabRef}>
            <AvFile
              avFile={avFile}
              i18n={props.i18n}
              fileType={fileType}
              key={tab.uuid}
              project={props.project}
              projectSlug={props.projectSlug}
              sets={sets}
              title={tab.title}
              uuid={tab.uuid}
              eventUuid={props.eventUuid}
              event={props.event}
            />
          </div>
        )}
      </div>
      {showEventDeleteModal && (
        <DeleteEventModal
          annotations={props.project.annotations}
          eventUuid={props.eventUuid}
          i18n={props.i18n}
          onAfterSave={() =>
            (window.location.pathname = `/${lang}/projects/${props.projectSlug}`)
          }
          onCancel={() => setShowEventDeleteModal(false)}
          projectSlug={props.projectSlug}
        />
      )}
    </>
  );
};

export default EventDetail;
