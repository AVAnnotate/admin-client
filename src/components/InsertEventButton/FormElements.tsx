import { TimeInput } from '@components/Formic/index.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { useCallback } from 'react';
import type { Includes } from '../../types/slate.ts';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';

interface ClipInterfaceProps {
  start?: number;
  end?: number;
  setStart: (arg: number) => void;
  setEnd: (arg: number) => void;
  i18n: Translations;
}

export const ClipInterface: React.FC<ClipInterfaceProps> = (props) => {
  const { t } = props.i18n;

  return (
    <div>
      <div className='include-clip-times'>
        <label>
          <TimeInput
            initialValue={props.start || 0}
            label={t['Start Time']}
            onChange={(val) => props.setStart(val)}
            required
          />
        </label>
        <label>
          <TimeInput
            initialValue={props.end || 0}
            label={t['End Time']}
            onChange={(val) => props.setEnd(val)}
            required
          />
        </label>
      </div>
    </div>
  );
};

interface DurationInterfaceProps {
  duration: 'full' | 'clip';
  setDuration: (arg: 'full' | 'clip') => void;
  i18n: Translations;
}

export const DurationInterface: React.FC<DurationInterfaceProps> = (props) => {
  const { t } = props.i18n;

  return (
    <div>
      <p>{t['Duration']}</p>
      <div className='duration-buttons'>
        <Button
          className={props.duration === 'full' ? 'primary' : 'outline'}
          onClick={() => props.setDuration('full')}
          type='button'
        >
          {t['Full Recording']}
        </Button>
        <Button
          className={props.duration === 'clip' ? 'primary' : 'outline'}
          onClick={() => props.setDuration('clip')}
          type='button'
        >
          {t['Clip']}
        </Button>
      </div>
    </div>
  );
};

interface IncludeInterfaceProps {
  includes: Includes[];
  setIncludes: (arg: Includes[]) => void;
  i18n: Translations;
}

export const IncludeInterface: React.FC<IncludeInterfaceProps> = (props) => {
  const { t } = props.i18n;

  const toggleInclude = useCallback(
    (type: Includes) => {
      if (props.includes.includes(type)) {
        props.setIncludes(props.includes.filter((i) => i !== type));
      } else {
        props.setIncludes([...props.includes, type]);
      }
    },
    [props.includes]
  );

  return (
    <div>
      <p>{t['Include']}</p>
      <div className='include-buttons'>
        <Button
          className={props.includes.includes('media') ? 'primary' : 'outline'}
          type='button'
          onClick={() => toggleInclude('media')}
        >
          {props.includes.includes('media') && <CheckIcon color='white' />}
          <span>{t['Media']}</span>
        </Button>
        <Button
          className={
            props.includes.includes('annotations') ? 'primary' : 'outline'
          }
          type='button'
          onClick={() => toggleInclude('annotations')}
        >
          {props.includes.includes('annotations') && (
            <CheckIcon color='white' />
          )}
          <span>{t['Annotations']}</span>
        </Button>
        <Button
          className={props.includes.includes('label') ? 'primary' : 'outline'}
          type='button'
          onClick={() => toggleInclude('label')}
        >
          {props.includes.includes('label') && <CheckIcon color='white' />}
          <span>{t['Label']}</span>
        </Button>
        <Button
          className={
            props.includes.includes('description') ? 'primary' : 'outline'
          }
          type='button'
          onClick={() => toggleInclude('description')}
        >
          {props.includes.includes('description') && (
            <CheckIcon color='white' />
          )}
          <span>{t['Description']}</span>
        </Button>
      </div>
    </div>
  );
};

interface EventSelectProps {
  project: ProjectData;
  eventUuid: string;
  setEventUuid: (arg: string) => void;
  label: string;
}

export const EventSelect: React.FC<EventSelectProps> = (props) => {
  return (
    <label className='slate-event-select'>
      {props.label}
      <Select.Root
        onValueChange={(val) => props.setEventUuid(val)}
        value={props.eventUuid}
      >
        <Select.Trigger className='slate-event-select-trigger'>
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Content className='select-content' position='popper'>
          <Select.Viewport className='select-viewport'>
            {/* @ts-ignore */}
            {Object.keys(props.project.events).map((uuid) => (
              <Select.Item className='select-item' key={uuid} value={uuid}>
                <Select.ItemText>
                  {/* @ts-ignore */}
                  {props.project.events[uuid].label}
                </Select.ItemText>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </label>
  );
};
