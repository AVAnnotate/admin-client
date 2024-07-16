import {
  QuestionMarkIcon,
  SpeakerLoudIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import './EmbeddedEvent.css';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { useCallback, useMemo, useState } from 'react';
import type {
  Includes,
  SlateCompareEventData,
  SlateEventNodeData,
} from '@ty/slate.ts';
import { Node, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { SingleEventModal } from '@components/InsertEventButton/SingleEventModal.tsx';
import { CompareEventsModal } from '@components/InsertEventButton/CompareEventsModal.tsx';

interface EmbeddedEventProps {
  project: ProjectData;
  i18n: Translations;
  element: SlateEventNodeData & Node;
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
    () => getEvent(props.project, props.element.uuid),
    [props.project, props.element.uuid]
  );

  const includeStr = useMemo(
    () => getIncludesLabel(props.element.includes),
    [props.element.includes]
  );

  const { t } = props.i18n;

  const clearModal = useCallback(() => setShowModal(false), []);

  const path = ReactEditor.findPath(editor, props.element);

  return (
    <div className='embedded-event' contentEditable={false}>
      {event ? (
        <>
          {showModal && (
            <SingleEventModal
              i18n={props.i18n}
              project={props.project}
              clearModal={clearModal}
              onSubmit={(data) => {
                Transforms.setNodes(editor, data, { at: path });
                setShowModal(false);
              }}
              eventUuid={props.element.uuid}
              includes={props.element.includes}
              start={props.element.start}
              end={props.element.end}
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
                onClick: () => Transforms.removeNodes(editor, { at: path }),
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

interface EmbeddedEventComparisonProps {
  project: ProjectData;
  i18n: Translations;
  element: SlateCompareEventData & Node;
}

export const EmbeddedEventComparison: React.FC<EmbeddedEventComparisonProps> = (
  props
) => {
  const [showModal, setShowModal] = useState(false);

  const editor = useSlate();

  const event1 = useMemo(
    () => getEvent(props.project, props.element.event1.uuid),
    [props.project, props.element.event1]
  );

  const event2 = useMemo(
    () => getEvent(props.project, props.element.event2.uuid),
    [props.project, props.element.event2]
  );

  const includeStr = useMemo(
    () => getIncludesLabel(props.element.includes),
    [props.element.includes]
  );

  const { t } = props.i18n;

  const clearModal = useCallback(() => setShowModal(false), []);

  const path = ReactEditor.findPath(editor, props.element);

  return (
    <div className='embedded-event' contentEditable={false}>
      {event1 && event2 ? (
        <>
          {showModal && (
            <CompareEventsModal
              i18n={props.i18n}
              project={props.project}
              clearModal={clearModal}
              onSubmit={(data) => {
                Transforms.setNodes(editor, data, { at: path });
                setShowModal(false);
              }}
              includes={props.element.includes}
              event1Uuid={props.element.event1.uuid}
              event2Uuid={props.element.event2.uuid}
              event1Start={props.element.event1.start}
              event1End={props.element.event1.end}
              event2Start={props.element.event2.start}
              event2End={props.element.event2.end}
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
                onClick: () => Transforms.removeNodes(editor, { at: path }),
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
