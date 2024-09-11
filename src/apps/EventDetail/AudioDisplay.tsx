import { PlusIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { Player } from './Player.tsx';
import { useState } from 'react';
import { SetSelect } from './SetSelect.tsx';
import { AnnotationTable } from './AnnotationTable.tsx';
import { EventHeader } from './EventHeader.tsx';
import type { EventDisplayProps } from './types.ts';
import { AnnotationTableHeader } from './AnnotationTableHeader.tsx';

import './EventDetail.css';
import { AnnotationSearchBox } from './AnnotationSearchBox.tsx';

export const AudioDisplay: React.FC<EventDisplayProps> = (props) => {
  const { t } = props.i18n;

  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  return (
    <>
      <div className='event-detail audio-event-detail container'>
        <div className='event-detail-floating-header'>
          <EventHeader
            avFileUuid={props.avFileUuid}
            event={props.event}
            eventUuid={props.eventUuid}
            i18n={props.i18n}
            projectSlug={props.projectSlug}
            setAvFile={props.stateHandlers.setAvFile}
            setShowEventDeleteModal={
              props.stateHandlers.setShowEventDeleteModal
            }
          />
          <Player
            type={props.event.item_type}
            i18n={props.i18n}
            url={props.event.audiovisual_files[props.avFileUuid].file_url}
            position={annoPosition}
          />
          <div className='set-info-bar'>
            <h3>{t['Annotations']}</h3>
            <div className='set-info-bar-right'>
              {props.sets.length > 1 && (
                <SetSelect
                  onChange={(uuid) =>
                    props.stateHandlers.setCurrentSetUuid(uuid)
                  }
                  sets={props.sets}
                  value={
                    props.sets.find((set) => set.uuid === props.setUuid) ||
                    props.sets[0]
                  }
                />
              )}
              <Button
                className='primary add-set-button'
                onClick={() => props.stateHandlers.setShowAddSetModal(true)}
              >
                {t['Add Set']}
                <PlusIcon />
              </Button>
            </div>
          </div>
          <AnnotationTableHeader
            displayAnnotations={props.displayAnnotations}
            i18n={props.i18n}
            onExport={props.onExport}
            sets={props.sets}
            setSearch={props.stateHandlers.setSearch}
            setShowAnnoCreateModal={props.stateHandlers.setShowAnnoCreateModal}
            setUuid={props.setUuid}
            eventUuid={props.eventUuid}
            projectSlug={props.projectSlug}
          >
            <AnnotationSearchBox setSearch={props.stateHandlers.setSearch} />
          </AnnotationTableHeader>
        </div>
        <AnnotationTable
          i18n={props.i18n}
          displayAnnotations={props.displayAnnotations}
          project={props.project}
          setDeleteAnnoUuid={props.stateHandlers.setDeleteAnnoUuid}
          setEditAnnoUuid={props.stateHandlers.setEditAnnoUuid}
          setAnnoPosition={setAnnoPosition}
        />
      </div>
    </>
  );
};
