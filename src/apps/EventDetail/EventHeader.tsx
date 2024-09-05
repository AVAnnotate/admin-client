import { serialize } from '@lib/slate/index.tsx';
import { Pencil2Icon, SpeakerLoudIcon, VideoIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import type { Event, Translations } from '@ty/Types.ts';
import { Trash } from 'react-bootstrap-icons';
import { AvFilePicker } from './AvFilePicker.tsx';

interface Props {
  avFileUuid: string;
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  setAvFile: (arg: string) => void;
  setShowEventDeleteModal: (arg: boolean) => void;
}

export const EventHeader: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  return (
    <>
      <div className='event-detail-top-bar'>
        <div className='event-detail-label'>
          {props.event.item_type === 'Audio' && <SpeakerLoudIcon />}
          {props.event.item_type === 'Video' && <VideoIcon />}
          <h2>{props.event.label}</h2>
        </div>
        <div className='event-detail-options'>
          <a
            href={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/edit`}
          >
            <Button className='event-detail-button edit-button' type='button'>
              <Pencil2Icon />
              {t['Edit']}
            </Button>
          </a>
          <Button
            className='event-detail-button delete-button'
            onClick={() => props.setShowEventDeleteModal(true)}
            type='button'
          >
            <Trash />
            {t['Delete']}
          </Button>
        </div>
      </div>
      <div>{serialize(props.event.description)}</div>
      {Object.keys(props.event.audiovisual_files).length > 1 && (
        <div className='av-file-selection'>
          <span className='av-file-label'>{t['AV File']}</span>
          <AvFilePicker
            event={props.event}
            onChange={(uuid) => props.setAvFile(uuid)}
            value={props.avFileUuid}
          />
        </div>
      )}
    </>
  );
};
