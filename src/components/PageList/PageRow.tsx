import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Box, Text } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { DraggedPage } from '@ty/ui.ts';
import { useMemo } from 'react';
import {
  ArrowReturnRight,
  BoxArrowUpRight,
  GripVertical,
  Trash,
} from 'react-bootstrap-icons';

interface Props {
  project: ProjectData;
  uuid: string;
  index: number;
  pickedUp: DraggedPage | null;
  setPickedUp: (arg: DraggedPage | null) => void;
  i18n: Translations;
  onDrop: () => Promise<void>;
}

export const PageRow: React.FC<Props> = (props) => {
  const page = useMemo(
    () => props.project.pages![props.uuid],
    [props.project, props.uuid]
  );

  const { t } = props.i18n;

  const meatballOptions = useMemo(() => {
    const options = [
      {
        label: t['Open'],
        icon: BoxArrowUpRight,
        onClick: () => {},
      },
      {
        label: t['Edit'],
        icon: Pencil2Icon,
        onClick: () =>
          (window.location.href = `${window.location.href}/pages/${props.uuid}`),
      },
    ];

    // only allow deletion in two cases:
    // 1. the page has no children
    // 2. the page is a child
    //
    // if the user wants to delete a page with children,
    // they need to delete all the children first
    if (
      page.parent ||
      Object.keys(props.project.pages!).filter(
        (key) => props.project.pages![key].parent === props.uuid
      ).length === 0
    ) {
      options.push({
        label: t['Delete'],
        icon: Trash,
        onClick: async () => {
          await fetch(
            `/api/projects/${props.project.project.github_org}+${props.project.project.slug}/pages/${props.uuid}`,
            {
              method: 'DELETE',
            }
          );

          window.location.reload();
        },
      });
    }

    return options;
  }, [page]);

  const dateString = useMemo(() => {
    if (page.updated_at === page.created_at) {
      const dateStr = new Date(page.created_at).toLocaleDateString();
      return `${t['Added']} ${dateStr}`;
    } else {
      const dateStr = new Date(page.updated_at).toLocaleDateString();
      return `${t['Last edited at']} ${dateStr}`;
    }
  }, [page]);

  return (
    <Box
      className={`page-list-box ${
        props.pickedUp?.hoverIndex === props.index
          ? 'page-list-box-hovered'
          : ''
      }`}
      draggable
      key={props.uuid}
      onDragStart={(ev) => {
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
        {page.parent && <ArrowReturnRight />}
        {page.title}
      </Text>
      <span>{dateString}</span>
      <MeatballMenu buttons={meatballOptions} row={page} />
    </Box>
  );
};
