import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { useMemo, useState } from 'react';
import Tabs from './Tabs.tsx';
import TabContent from './TabContent.tsx';
import './styles.css';

interface EventDetailProps {
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

export const EventDetail: React.FC<EventDetailProps> = (props) => {
  const { t, lang } = props.i18n;

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
        <TabContent
          avFile={props.event.audiovisual_files[tab.uuid]}
          i18n={props.i18n}
          title={tab.title}
        />
      </div>
    </>
  );
};

export default EventDetail;
