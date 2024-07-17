import { TimeInput } from '@components/Formic/index.tsx';
import { Button } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { useCallback } from 'react';
import type { Includes } from '../../types/slate.ts';
import { CheckIcon } from '@radix-ui/react-icons';

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
    <>
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
    </>
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
    <>
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
    </>
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
    <>
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
    </>
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
    <label>
      {props.label}
      <select
        className='formic-form-select'
        onChange={(ev) => props.setEventUuid(ev.target.value)}
        value={props.eventUuid}
      >
        {Object.keys(props.project.events).map((uuid) => (
          <option key={uuid} value={uuid}>
            {props.project.events[uuid].label}
          </option>
        ))}
      </select>
    </label>
  );
};
