import { QuestionMarkIcon, SpeakerLoudIcon } from '@radix-ui/react-icons';
import './EmbeddedEvent.css';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import type { ProjectData } from '@ty/Types.ts';
import { useMemo } from 'react';

interface EmbeddedEventProps {
  uuid: string;
  includes: string[];
  start?: number;
  end?: number;
  project: ProjectData;
}

export const EmbeddedEvent: React.FC<EmbeddedEventProps> = (props) => {
  const event = useMemo(() => {
    // avoid crashing if the event isn't found, e.g. if the user
    // deletes an event after embedding it in a page
    const found = Object.hasOwn(props.project.events, props.uuid);
    if (!found) {
      return null;
    } else {
      return props.project.events[props.uuid];
    }
  }, [props.project, props.uuid]);

  const includeStr = useMemo(() => {
    return props.includes
      .map((i) => `${i[0].toLocaleUpperCase()}${i.slice(1)}`)
      .join(', ');
  }, [props.includes]);

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
