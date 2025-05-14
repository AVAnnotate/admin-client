import type { ProjectData, Translations } from '@ty/Types.ts';
import { EventList } from '@components/EventList/EventList.tsx';
import * as Tabs from '@radix-ui/react-tabs';
import { Tags } from '@apps/Tags/Tags.tsx';
import { useState } from 'react';
import { DeleteEventModal } from '@components/DeleteEventModal/DeleteEventModal.tsx';

import './DataManager.css';

interface DataManagerProps {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const DataManager = (props: DataManagerProps) => {
  const [deleteUuid, setDeleteUuid] = useState<null | string>(null);

  const handleDeleteEvent = (uuid: string) => {
    setDeleteUuid(uuid);
  };

  const { t } = props.i18n;

  return (
    <div className='data-manager-container'>
      <Tabs.Root className='tabs-root' defaultValue='tab1'>
        <Tabs.List className='tabs-list'>
          <Tabs.Trigger className='tabs-trigger' value='tab1'>
            {t['Events']}
          </Tabs.Trigger>
          <Tabs.Trigger className='tabs-trigger' value='tab2'>
            {t['Tags']}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className='tabs-content' value='tab1'>
          <EventList
            i18n={props.i18n}
            project={props.project}
            projectSlug={props.projectSlug}
            onDelete={handleDeleteEvent}
          />
        </Tabs.Content>
        <Tabs.Content className='tabs-content' value='tab2'>
          <Tags
            i18n={props.i18n}
            project={props.project}
            projectSlug={props.projectSlug}
          />
        </Tabs.Content>
      </Tabs.Root>
      {deleteUuid && (
        <DeleteEventModal
          annotations={props.project.annotations}
          eventUuid={deleteUuid}
          i18n={props.i18n}
          onAfterSave={() => window.location.reload()}
          onCancel={() => setDeleteUuid(null)}
          projectSlug={props.projectSlug}
        />
      )}
    </div>
  );
};
