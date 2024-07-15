import {
  QuestionMarkIcon,
  SpeakerLoudIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import './EmbeddedEvent.css';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { useCallback, useMemo, useState } from 'react';
import type { Includes, SlateCompareEventData } from '@ty/slate.ts';
import { Transforms } from 'slate';
import { useSlate } from 'slate-react';
import { SingleEventModal } from '@components/PageForm/InsertButton/SingleEventModal.tsx';
import { CompareEventsModal } from '@components/PageForm/InsertButton/CompareEventsModal.tsx';

interface EmbeddedEventProps {
  uuid: string;
  includes: Includes[];
  start?: number;
  end?: number;
  project: ProjectData;
  i18n: Translations;
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
  const [showModal, setShowModal] = useState(false);

  const editor = useSlate();

  const event = useMemo(
    () => getEvent(props.project, props.uuid),
    [props.project, props.uuid]
  );

  const includeStr = useMemo(
    () => getIncludesLabel(props.includes),
    [props.includes]
  );

  const { t } = props.i18n;

  const clearModal = useCallback(() => setShowModal(false), []);

  return (
    <div className='embedded-event' contentEditable={false}>
      {event ? (
        <>
          {showModal && (
            <SingleEventModal
              i18n={props.i18n}
              project={props.project}
              clearModal={clearModal}
              onSubmit={() => {}}
              eventUuid={props.uuid}
              includes={props.includes}
              start={props.start}
              end={props.end}
            />
          )}
          <div className='embedded-event-left'>
            {event.item_type === 'Audio' && <SpeakerLoudIcon />}
            {event.item_type === 'Video' && <VideoIcon />}
            <strong>{event.label}</strong>
          </div>
          <span>
            <em>{includeStr}</em>
          </span>
          <MeatballMenu
            row={props}
            buttons={[
              {
                label: t['Edit'],
                onClick: () => setShowModal(true),
              },
              {
                label: t['Delete'],
                onClick: () => Transforms.removeNodes(editor),
              },
            ]}
          />
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
  const [showModal, setShowModal] = useState(false);

  const editor = useSlate();

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

  const clearModal = useCallback(() => setShowModal(false), []);

  return (
    <div className='embedded-event' contentEditable={false}>
      {event1 && event2 ? (
        <>
          {showModal && (
            <CompareEventsModal
              i18n={props.i18n}
              project={props.project}
              clearModal={clearModal}
              onSubmit={() => {}}
              includes={props.includes}
              event1Uuid={props.event1.uuid}
              event2Uuid={props.event2.uuid}
              event1Start={props.event1.start}
              event1End={props.event1.end}
              event2Start={props.event2.start}
              event2End={props.event2.end}
            />
          )}
          <div className='embedded-event-left'>
            <strong>{t['Item Comparison']}</strong>
          </div>
          <span>{`${event1.label} / ${event2.label}`}</span>
          <span>
            <em>{includeStr}</em>
          </span>
          <MeatballMenu
            row={props}
            buttons={[
              {
                label: t['Edit'],
                onClick: () => setShowModal(true),
              },
              {
                label: t['Delete'],
                // todo: removes last node instead of the event
                // need location by index (I think?)
                onClick: () => Transforms.removeNodes(editor),
              },
            ]}
          />
        </>
      ) : (
        <QuestionMarkIcon />
      )}
    </div>
  );
};
