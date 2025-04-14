import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { useMemo, useState } from 'react';
import Tabs from './Tabs.tsx';
import AvFile from './AvFile.tsx';
import './styles.css';
import { DeleteEventModal } from '@components/DeleteEventModal/index.ts';

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

    return uuids.map((uuid, index) => ({
      uuid,
      title: isSingleAvFile
        ? props.event.audiovisual_files[uuid].label
        : `${index + 1}. ${props.event.audiovisual_files[uuid].label}`,
    }));
  }, []);

  const [tab, setTab] = useState(tabs[0]);

  const sets = useMemo(() => {
    return Object.keys(props.project.annotations).filter((uuid) => {
      const setObj = props.project.annotations[uuid];

      return (
        setObj.event_id === props.eventUuid && setObj.source_id === tab.uuid
      );
    });
  }, [tab, props.project.annotations]);

  // all annotation sets from this project
  const [allAnnotations, setAllAnnotations] = useState(
    Object.fromEntries(
      Object.entries(props.project.annotations).filter((ent) => {
        const anno = props.project.annotations[ent[0]];

        return anno.event_id === props.eventUuid;
      })
    )
  );

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
          </div>
        </div>
        <div className='container'>
          {tabs.length > 1 && (
            <Tabs currentTab={tab} tabs={tabs} setTab={setTab} />
          )}
        </div>
        <AvFile
          fileUrl={props.event.audiovisual_files[tab.uuid].file_url}
          i18n={props.i18n}
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
