import { QuestionMarkIcon, SpeakerLoudIcon } from '@radix-ui/react-icons';
import './EmbeddedEvent.css';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';
import type { Includes, SlateCompareEventData } from '@ty/slate.ts';

interface EmbeddedEventProps {
  uuid: string;
  includes: Includes[];
  start?: number;
  end?: number;
  project: ProjectData;
}

const getEvent = (project: ProjectData, uuid: string) => {
  // avoid crashing if the event isn't found, e.g. if the user
  // deletes an event after embedding it in a page
  const found = Object.hasOwn(project.events, uuid);
  if (!found) {
    return null;
  } else {
    return project.events[uuid];
  }
};

const getIncludesLabel = (includes: Includes[]) =>
  includes.map((i) => `${i[0].toLocaleUpperCase()}${i.slice(1)}`).join(', ');

export const EmbeddedEvent: React.FC<EmbeddedEventProps> = (props) => {
  const event = useMemo(
    () => getEvent(props.project, props.uuid),
    [props.project, props.uuid]
  );

  const includeStr = useMemo(
    () => getIncludesLabel(props.includes),
    [props.includes]
  );

  return (
    <div className='embedded-event' contentEditable={false}>
      {event ? (
        <>
          <div className='embedded-event-left'>
            <SpeakerLoudIcon />
            <strong>{event.label}</strong>
          </div>
          <span>
            <em>{includeStr}</em>
          </span>
          {/* todo */}
          <MeatballMenu row={[]} buttons={[]} />
        </>
      ) : (
        <QuestionMarkIcon />
      )}
    </div>
  );
};

interface EmbeddedEventComparisonProps extends SlateCompareEventData {
  project: ProjectData;
  i18n: Translations;
}

export const EmbeddedEventComparison: React.FC<EmbeddedEventComparisonProps> = (
  props
) => {
  const event1 = useMemo(
    () => getEvent(props.project, props.event1.uuid),
    [props.project, props.event1]
  );

  const event2 = useMemo(
    () => getEvent(props.project, props.event2.uuid),
    [props.project, props.event2]
  );

  const includeStr = useMemo(
    () => getIncludesLabel(props.includes),
    [props.includes]
  );

  const { t } = props.i18n;

  return (
    <div className='embedded-event' contentEditable={false}>
      {event1 && event2 ? (
        <>
          <div className='embedded-event-left'>
            <strong>{t['Item Comparison']}</strong>
          </div>
          <span>{`${event1.label} / ${event2.label}`}</span>
          <span>
            <em>{includeStr}</em>
          </span>
          {/* todo */}
          <MeatballMenu row={[]} buttons={[]} />
        </>
      ) : (
        <QuestionMarkIcon />
      )}
    </div>
  );
};
