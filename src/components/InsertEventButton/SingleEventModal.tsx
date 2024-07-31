import * as Dialog from '@radix-ui/react-dialog';
import type { Includes, SlateEventNodeData } from '../../types/slate.ts';
import { useEffect, useMemo, useState } from 'react';
import {
  ClipInterface,
  DurationInterface,
  EventSelect,
  FileRadioInterface,
  IncludeInterface,
} from './FormElements.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';

export interface SingleEventModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (event: SlateEventNodeData) => void;
  // form state
  eventUuid?: string;
  file?: string;
  duration?: 'full' | 'clip';
  includes?: Includes[];
  start?: number;
  end?: number;
}

export const SingleEventModal: React.FC<SingleEventModalProps> = (props) => {
  const [eventUuid, setEventUuid] = useState<string>(
    props.eventUuid ||
      // @ts-ignore
      (Object.keys(props.project.events).length > 0
        ? // @ts-ignore
          Object.keys(props.project.events)[0]
        : '')
  );
  const [duration, setDuration] = useState<'full' | 'clip'>(
    props.start || props.end ? 'clip' : 'full'
  );
  const [file, setFile] = useState(props.file || '');
  const [includes, setIncludes] = useState<Includes[]>(props.includes || []);
  const [start, setStart] = useState<number | undefined>(props.start);
  const [end, setEnd] = useState<number | undefined>(props.end);

  const event = useMemo(() => {
    if (eventUuid && props.project.events![eventUuid]) {
      return props.project.events![eventUuid];
    } else {
      return null;
    }
  }, [eventUuid]);

  // Default to the only AV file if there's only one
  useEffect(() => {
    if (event && Object.keys(event.audiovisual_files).length === 1) {
      setFile(Object.keys(event.audiovisual_files)[0]);
    }
  }, [event]);

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title className='slate-dialog-title'>
          {t['Embed Event']}
        </Dialog.Title>
        <div className='slate-dialog-body'>
          {Object.keys(props.project.events!).length === 0 ? (
            <p>{t['This project has no events.']}</p>
          ) : (
            <>
              <EventSelect
                eventUuid={eventUuid}
                setEventUuid={setEventUuid}
                project={props.project}
                label={t['Audiovisual event']}
              />
              <DurationInterface
                duration={duration}
                setDuration={setDuration}
                i18n={props.i18n}
              />
              {duration === 'clip' && (
                <>
                  {event && Object.keys(event.audiovisual_files).length > 1 && (
                    <FileRadioInterface
                      i18n={props.i18n}
                      files={event.audiovisual_files}
                      selectedFile={file}
                      setSelectedFile={(newFile) => setFile(newFile)}
                    />
                  )}
                  <ClipInterface
                    start={start}
                    end={end}
                    setStart={setStart}
                    setEnd={setEnd}
                    i18n={props.i18n}
                  />
                </>
              )}
              <IncludeInterface
                includes={includes}
                setIncludes={setIncludes}
                i18n={props.i18n}
              />
            </>
          )}
        </div>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
              onClick={props.clearModal}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              className='primary'
              role='button'
              disabled={duration === 'clip' && !file}
              onClick={() =>
                props.onSubmit({
                  uuid: eventUuid,
                  includes: includes,
                  start,
                  end,
                  file,
                })
              }
            >
              {t['Embed']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
