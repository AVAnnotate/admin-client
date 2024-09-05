import './EventDetail.css';
import {
  DownloadIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { Player } from './Player.tsx';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';
import { useRef, useState } from 'react';
import { SetSelect } from './SetSelect.tsx';
import { AnnotationTable } from './AnnotationTable.tsx';
import { exportAnnotations } from '@lib/events/export.ts';
import { EventHeader } from './EventHeader.tsx';
import type { EventDisplayProps } from './types.ts';

export const AudioDisplay: React.FC<EventDisplayProps> = (props) => {
  const { lang, t } = props.i18n;

  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  return (
    <>
      <div className='event-detail container'>
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
          <div className='event-detail-table-header'>
            <p>
              {props.sets.length > 1
                ? props.sets.find((set) => set.uuid === props.setUuid)?.label
                : t['All Annotations']}
              ({props.displayAnnotations.length})
            </p>
            <div className='header-buttons'>
              <div className='formic-form-field'>
                <input
                  className='searchbox formic-form-text'
                  onChange={(ev) => {
                    if (searchDebounceTimer.current) {
                      clearTimeout(searchDebounceTimer.current);
                    }

                    searchDebounceTimer.current = setTimeout(
                      () => props.stateHandlers.setSearch(ev.target.value),
                      200
                    );
                  }}
                  type='text'
                />
                <MagnifyingGlassIcon />
              </div>
              {props.setUuid && (
                <Button
                  className='csv-button'
                  onClick={() => {
                    if (props.setUuid) {
                      exportAnnotations(
                        props.allAnnotations[props.setUuid].annotations,
                        props.event,
                        props.avFileUuid
                      );
                    }
                  }}
                  type='button'
                >
                  <DownloadIcon />
                  {t['CSV']}
                </Button>
              )}
              <Button
                className='primary'
                onClick={() =>
                  (window.location.pathname = `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/import`)
                }
              >
                <FileEarmarkArrowUp />
                {t['import']}
              </Button>
              <Button
                className='primary'
                onClick={() => props.stateHandlers.setShowAnnoCreateModal(true)}
              >
                <PlusIcon />
                {t['Add']}
              </Button>
            </div>
          </div>
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
