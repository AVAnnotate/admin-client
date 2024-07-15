import * as Dialog from '@radix-ui/react-dialog';
import type { Includes, SlateEventNodeData } from '../../../types/slate.ts';
import { useState } from 'react';
import {
  ClipInterface,
  DurationInterface,
  EventSelect,
  IncludeInterface,
} from './FormElements.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';

export interface InsertEventModalProps {
  i18n: Translations;
  clearModal: () => void;
  project: ProjectData;
  onSubmit: (event: SlateEventNodeData) => void;
  // form state
  eventUuid?: string;
  duration?: 'full' | 'clip';
  includes?: Includes[];
  start?: number;
  end?: number;
}

export const SingleEventModal: React.FC<InsertEventModalProps> = (props) => {
  const [eventUuid, setEventUuid] = useState<string>(
    props.eventUuid ||
      (Object.keys(props.project.events).length > 0
        ? Object.keys(props.project.events)[0]
        : '')
  );
  const [duration, setDuration] = useState<'full' | 'clip'>(
    props.start || props.end ? 'clip' : 'full'
  );
  const [includes, setIncludes] = useState<Includes[]>(props.includes || []);
  const [start, setStart] = useState<number | undefined>(props.start);
  const [end, setEnd] = useState<number | undefined>(props.end);

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{t['Insert event']}</Dialog.Title>
        <div>
          {Object.keys(props.project.events).length === 0 ? (
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
                <ClipInterface
                  start={start}
                  end={end}
                  setStart={setStart}
                  setEnd={setEnd}
                  i18n={props.i18n}
                />
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
              className='outline'
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
                  uuid: eventUuid,
                  includes: includes,
                  start,
                  end,
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
