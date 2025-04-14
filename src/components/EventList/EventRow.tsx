import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Box, Text } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { DraggedPage, MeatballMenuItem } from '@ty/ui.ts';
import { useMemo } from 'react';
import {
  BoxArrowUpRight,
  GripVertical,
  BoxArrowUp,
  PencilSquare,
  Trash3,
} from 'react-bootstrap-icons';

interface Props {
  project: ProjectData;
  uuid: string;
  index: number;
  pickedUp: DraggedPage | null;
  setPickedUp: (arg: DraggedPage | null) => void;
  i18n: Translations;
  onDrop: () => Promise<void>;
  onDelete(uuid: string): void;
}

export const EventRow: React.FC<Props> = (props) => {
  const event = useMemo(
    () => props.project.events![props.uuid],
    [props.project, props.uuid]
  );

  const { t } = props.i18n;

  const meatballOptions: MeatballMenuItem[] = [
    {
      label: t['Open'],
      icon: BoxArrowUp,
      onClick: () =>
        (window.location.pathname = `${window.location.pathname}/events/${props.uuid}`),
    },
    {
      label: t['Open in new tab'],
      icon: BoxArrowUpRight,
      onClick: () =>
        window.open(
          `${window.location.pathname}/events/${props.uuid}`,
          '_blank'
        ),
    },
    {
      label: t['Edit event settings'],
      icon: PencilSquare,
      onClick: () =>
        (window.location.pathname = `${window.location.pathname}/events/${props.uuid}/edit`),
    },
    {
      label: t['Delete'],
      icon: Trash3,
      onClick: () => props.onDelete(props.uuid),
    },
  ];

  const avTypes = useMemo(() => {
    const types: string[] = [];

    for (const avFile in props.project.events[props.uuid].audiovisual_files) {
      const file = props.project.events[props.uuid].audiovisual_files[avFile];
      const legacy = props.project.events[props.uuid].item_type;

      if (legacy) {
        types.push(legacy);
      }
      if (!types.includes(file.file_type)) {
        types.push(file.file_type);
      }
    }

    console.log(types);
    return types;
  }, [props.project]);

  return (
    <Box
      className={`event-list-box ${
        props.pickedUp?.hoverIndex === props.index
          ? 'event-list-box-hovered'
          : ''
      }`}
      draggable
      key={props.uuid}
      onDragStart={(_ev) => {
        props.setPickedUp({
          uuid: props.uuid,
          originalIndex: props.index,
          hoverIndex: props.index,
        });
      }}
      onDragOver={(ev) => {
        ev.preventDefault();
        if (props.pickedUp) {
          props.setPickedUp({
            ...props.pickedUp,
            hoverIndex: props.index,
          });
        }
      }}
      onDrop={async () => await props.onDrop()}
      onDragEnd={() => props.setPickedUp(null)}
      height='56px'
      width='100%'
    >
      <GripVertical />
      <Text className='page-title' weight='bold'>
        {event.label}
      </Text>
      <div>{avTypes.join(',')}</div>
      <MeatballMenu buttons={meatballOptions} row={event} />
    </Box>
  );
};
