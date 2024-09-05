import { SpeakerLoudIcon, VideoIcon } from '@radix-ui/react-icons';
import type { Event } from '@ty/Types.ts';

interface Props {
  event: Event;
}

export const EventLabel: React.FC<Props> = (props) => {
  return (
    <div className='event-detail-label'>
      {props.event.item_type === 'Audio' && <SpeakerLoudIcon />}
      {props.event.item_type === 'Video' && <VideoIcon />}
      <h2>{props.event.label}</h2>
    </div>
  );
};
