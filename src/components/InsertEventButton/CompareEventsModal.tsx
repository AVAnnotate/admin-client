import * as Dialog from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';
import {
  ClipInterface,
  DurationInterface,
  EventSelect,
  FileRadioInterface,
  IncludeInterface,
} from './FormElements.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { Includes, SlateCompareEventData } from '../../types/slate.ts';
import './CompareEventsModal.css';

interface CompareEventsModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (arg: SlateCompareEventData) => void;
  // form state
  event1Uuid?: string;
  event2Uuid?: string;
  event1File?: string;
  event2File?: string;
  duration?: 'full' | 'clip';
  includes?: Includes[];
  event1Start?: number;
  event1End?: number;
  event2Start?: number;
  event2End?: number;
  event1Type?: string;
  event2Type?: string;
}

export const CompareEventsModal: React.FC<CompareEventsModalProps> = (
  props
) => {
  const [duration, setDuration] = useState<'full' | 'clip'>(
    [
      props.event1Start,
      props.event1End,
      props.event2Start,
      props.event2End,
    ].filter(Boolean).length > 0
      ? 'clip'
      : 'full'
  );
  const [event1Uuid, setEvent1Uuid] = useState(
    props.event1Uuid ||
      (Object.keys(props.project.events!).length > 0
        ? Object.keys(props.project.events!)[0]
        : '')
  );
  const [event2Uuid, setEvent2Uuid] = useState(
    props.event2Uuid ||
      (Object.keys(props.project.events!).length > 1
        ? Object.keys(props.project.events!)[1]
        : '')
  );
  const [includes, setIncludes] = useState<Includes[]>(
    props.includes || ['media', 'annotations', 'label', 'description']
  );
  const [event1File, setEvent1File] = useState(props.event1File || null);
  const [event2File, setEvent2File] = useState(props.event2File || null);
  const [event1Start, setEvent1Start] = useState<number | undefined>(
    props.event1Start
  );
  const [event2Start, setEvent2Start] = useState<number | undefined>(
    props.event2Start
  );
  const [event1End, setEvent1End] = useState<number | undefined>(
    props.event1End
  );
  const [event2End, setEvent2End] = useState<number | undefined>(
    props.event2End
  );

  const event1Type =
    event1Uuid && event1File
      ? props.project.events[event1Uuid].audiovisual_files[event1File].file_type
      : undefined;
  const event2Type =
    event2Uuid && event2File
      ? props.project.events[event2Uuid].audiovisual_files[event2File].file_type
      : undefined;

  const event1 = useMemo(() => {
    if (event1Uuid && props.project.events![event1Uuid]) {
      return props.project.events![event1Uuid];
    } else {
      return null;
    }
  }, [event1Uuid]);

  const event2 = useMemo(() => {
    if (event2Uuid && props.project.events![event2Uuid]) {
      return props.project.events![event2Uuid];
    } else {
      return null;
    }
  }, [event2Uuid]);

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title className='slate-dialog-title'>
          {t['Compare Events']}
        </Dialog.Title>
        <div className='slate-dialog-body'>
          <DurationInterface
            duration={duration}
            setDuration={setDuration}
            i18n={props.i18n}
          />
          <EventSelect
            eventUuid={event1Uuid}
            setEventUuid={setEvent1Uuid}
            project={props.project}
            label={`${t['Audiovisual Event']} 1`}
          />
          {duration === 'clip' && (
            <div className='event-options-container'>
              <div>
                {event1 && (
                  <FileRadioInterface
                    i18n={props.i18n}
                    files={event1.audiovisual_files}
                    selectedFile={event1File}
                    setSelectedFile={(newFile) => setEvent1File(newFile)}
                  />
                )}
                <ClipInterface
                  i18n={props.i18n}
                  start={event1Start}
                  setStart={setEvent1Start}
                  end={event1End}
                  setEnd={setEvent1End}
                />
              </div>
            </div>
          )}
          <EventSelect
            eventUuid={event2Uuid}
            setEventUuid={setEvent2Uuid}
            project={props.project}
            label={`${t['Audiovisual Event']} 2`}
          />
          {duration === 'clip' && (
            <div className='event-options-container'>
              <div>
                {event2 && (
                  <FileRadioInterface
                    i18n={props.i18n}
                    files={event2.audiovisual_files}
                    selectedFile={event2File}
                    setSelectedFile={(newFile) => setEvent2File(newFile)}
                  />
                )}
                <ClipInterface
                  i18n={props.i18n}
                  start={event2Start}
                  setStart={setEvent2Start}
                  end={event2End}
                  setEnd={setEvent2End}
                />
              </div>
            </div>
          )}
          <IncludeInterface
            includes={includes}
            setIncludes={setIncludes}
            i18n={props.i18n}
          />
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
                disabled={duration === 'clip' && (!event1File || !event2File)}
                role='button'
                onClick={() =>
                  props.onSubmit({
                    includes,
                    event1: {
                      uuid: event1Uuid,
                      start: event1Start,
                      end: event1End,
                      file: event1File || undefined,
                      type: event1Type || undefined,
                    },
                    event2: {
                      uuid: event2Uuid,
                      start: event2Start,
                      end: event2End,
                      file: event2File || undefined,
                      type: event2Type || undefined,
                    },
                  })
                }
              >
                {t['Embed']}
              </Button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
