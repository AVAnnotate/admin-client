import { useState } from 'react';
import { AnnotationTable } from './AnnotationTable.tsx';
import { AnnotationTableHeader } from './AnnotationTableHeader.tsx';
import { EventHeader } from './EventHeader.tsx';
import { Player } from './Player.tsx';
import type { EventDisplayProps } from './types.ts';
import { Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { SetSelect } from './SetSelect.tsx';

export const VideoDisplay: React.FC<EventDisplayProps> = (props) => {
  const { t } = props.i18n;

  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  return (
    <>
      <div className='event-detail video-event-detail'>
        <div className='video-pane'>
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
            type='Video'
            i18n={props.i18n}
            url={props.event.audiovisual_files[props.avFileUuid].file_url}
            position={annoPosition}
          />
        </div>
        <div>
          <div>
            <h3>{t['Annotations']}</h3>
            <div>
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
          />
          <div className='table-container'>
            <AnnotationTable
              i18n={props.i18n}
              displayAnnotations={props.displayAnnotations}
              project={props.project}
              setDeleteAnnoUuid={props.stateHandlers.setDeleteAnnoUuid}
              setEditAnnoUuid={props.stateHandlers.setEditAnnoUuid}
              setAnnoPosition={setAnnoPosition}
            />
          </div>
        </div>
      </div>
    </>
  );
};
