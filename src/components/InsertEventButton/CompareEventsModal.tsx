import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import {
  ClipInterface,
  DurationInterface,
  EventSelect,
  IncludeInterface,
} from './FormElements.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { Includes, SlateCompareEventData } from '../../types/slate.ts';

interface CompareEventsModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (arg: SlateCompareEventData) => void;
  // form state
  event1Uuid?: string;
  event2Uuid?: string;
  duration?: 'full' | 'clip';
  includes?: Includes[];
  event1Start?: number;
  event1End?: number;
  event2Start?: number;
  event2End?: number;
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
      (Object.keys(props.project.events).length > 0
        ? Object.keys(props.project.events)[0]
        : '')
  );
  const [event2Uuid, setEvent2Uuid] = useState(
    props.event2Uuid ||
      (Object.keys(props.project.events).length > 1
        ? Object.keys(props.project.events)[1]
        : '')
  );
  const [includes, setIncludes] = useState<Includes[]>(props.includes || []);
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
            label={`${t['Audiovisual Item']} 1`}
          />
          {duration === 'clip' && (
            <ClipInterface
              i18n={props.i18n}
              start={event1Start}
              setStart={setEvent1Start}
              end={event1End}
              setEnd={setEvent1End}
            />
          )}
          <EventSelect
            eventUuid={event2Uuid}
            setEventUuid={setEvent2Uuid}
            project={props.project}
            label={`${t['Audiovisual Item']} 2`}
          />
          {duration === 'clip' && (
            <ClipInterface
              i18n={props.i18n}
              start={event2Start}
              setStart={setEvent2Start}
              end={event2End}
              setEnd={setEvent2End}
            />
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
                role='button'
                onClick={() =>
                  props.onSubmit({
                    includes,
                    event1: {
                      uuid: event1Uuid,
                      start: event1Start,
                      end: event1End,
                    },
                    event2: {
                      uuid: event2Uuid,
                      start: event2Start,
                      end: event2End,
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
