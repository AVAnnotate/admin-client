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

    for (const avFile in props.project.events[event.uuid].audiovisual_files) {
      const file = props.project.events[event.uuid].audiovisual_files[avFile];
      const legacy = props.project.events[event.uuid].item_type;

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
    <Box className='event-list-box' key={event.uuid} height='56px' width='100%'>
      <Text className='page-title' weight='bold'>
        {event.label}
      </Text>
      <div>{avTypes.join(',')}</div>
      <div>{new Date(event.updated_at).toLocaleDateString()}</div>
      <MeatballMenu buttons={meatballOptions} row={event} />
    </Box>
  );
};
