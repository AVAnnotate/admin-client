import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Box, Text } from '@radix-ui/themes';
import type { EventWithUUID, ProjectData, Translations } from '@ty/Types.ts';
import type { MeatballMenuItem } from '@ty/ui.ts';
import { useMemo } from 'react';
import {
  BoxArrowUpRight,
  BoxArrowUp,
  PencilSquare,
  Trash3,
} from 'react-bootstrap-icons';

interface Props {
  project: ProjectData;
  event: EventWithUUID;
  index: number;
  i18n: Translations;

  onDelete(): void;
}

const truncate = (str: string) => {
  if (str.length <= 36) {
    return str;
  }

  return `${str.slice(0, 36)}...`;
};

export const EventRow: React.FC<Props> = (props) => {
  const { event } = props;
  const { t } = props.i18n;

  const meatballOptions: MeatballMenuItem[] = [
    {
      label: t['Open'],
      icon: BoxArrowUp,
      onClick: () =>
        (window.location.pathname = `${window.location.pathname}/events/${event.uuid}`),
    },
    {
      label: t['Open in new tab'],
      icon: BoxArrowUpRight,
      onClick: () =>
        window.open(
          `${window.location.pathname}/events/${event.uuid}`,
          '_blank'
        ),
    },
    {
      label: t['Edit event settings'],
      icon: PencilSquare,
      onClick: () =>
        (window.location.pathname = `${window.location.pathname}/events/${event.uuid}/edit`),
    },
    {
      label: t['Delete'],
      icon: Trash3,
      onClick: () => props.onDelete(),
    },
  ];

  const avTypes = useMemo(() => {
    const types: string[] = [];

    const legacy = props.project.events[event.uuid].item_type;

    if (legacy) {
      types.push(legacy);
    }

    for (const avFile in props.project.events[event.uuid].audiovisual_files) {
      const file = props.project.events[event.uuid].audiovisual_files[avFile];
      if (file.file_type && !types.includes(file.file_type)) {
        types.push(file.file_type);
      }
    }

    return types;
  }, [props.project]);

  return (
    <Box className='event-list-box' key={event.uuid} height='56px' width='100%'>
      <div
        className='event-list-clickable'
        onClick={() =>
          (window.location.pathname = `${window.location.pathname}/events/${event.uuid}`)
        }
      >
        <Text className='page-title event-list-title' weight='bold'>
          {truncate(event.label)}
        </Text>
        <div>{avTypes.join(',')}</div>
        <div>{new Date(event.updated_at).toLocaleDateString()}</div>
      </div>
      <MeatballMenu buttons={meatballOptions} row={event} />
    </Box>
  );
};
