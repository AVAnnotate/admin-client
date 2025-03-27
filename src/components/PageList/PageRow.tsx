import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Box, Text } from '@radix-ui/themes';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { DraggedPage, MeatballMenuItem } from '@ty/ui.ts';
import { useMemo } from 'react';
import {
  ArrowReturnRight,
  BoxArrowUpRight,
  GripVertical,
  Trash,
  FiletypeHtml,
  AlignTop,
  ListNested,
  House,
  HouseFill,
} from 'react-bootstrap-icons';

interface Props {
  project: ProjectData;
  uuid: string;
  index: number;
  pickedUp: DraggedPage | null;
  setPickedUp: (arg: DraggedPage | null) => void;
  i18n: Translations;
  onDrop: () => Promise<void>;
  onDisableAutoGeneration(): void;
  onReEnableAutoGeneration(): void;
  onDesignateHome(): void;
  onMakeTopLevel(): void;
  onSetParent(pageId: string): void;
  onDelete(): void;
}

export const PageRow: React.FC<Props> = (props) => {
  const page = useMemo(
    () => props.project.pages![props.uuid],
    [props.project, props.uuid]
  );

  const { t } = props.i18n;

  const meatballOptionsAutoGen = useMemo(() => {
    const options: MeatballMenuItem[] = [
      {
        label: t['Disable Auto-Generation'],
        icon: FiletypeHtml,
        onClick: () => props.onDisableAutoGeneration(),
      },
      {
        label: t['Open'],
        icon: BoxArrowUpRight,
        onClick: () => {
          // See what kind of page this is
          const type = props.project.pages[props.uuid].autogenerate.enabled
            ? props.project.pages[props.uuid].autogenerate.type
            : 'page';
          let url;
          if (type === 'home') {
            url = `https://${props.project.project.github_org}.github.io/${props.project.project.slug}/`;
          } else if (type === 'event') {
            url = `https://${props.project.project.github_org}.github.io/${
              props.project.project.slug
            }/events/${props.project.pages[props.uuid].slug || props.uuid}`;
          } else {
            url = `https://${props.project.project.github_org}.github.io/${
              props.project.project.slug
            }/pages/${props.project.pages[props.uuid].slug || props.uuid}`;
          }
          return window.open(url, '_blank');
        },
      },
    ];

    // Make a page top level
    if (page.parent) {
      options.push({
        label: t['Move to Top Level'],
        icon: AlignTop,
        // @ts-ignore
        onClick: () => props.onMakeTopLevel(),
      });
    }

    // Re-parent
    const childPages: MeatballMenuItem[] = [];
    for (const pageId in props.project.pages) {
      if (pageId !== props.uuid) {
        const page = props.project.pages[pageId];

        childPages.push({
          label: page.title,
          icon: ListNested,
          // @ts-ignore
          onClick: () => props.onSetParent(pageId),
        });
      }
    }
    if (childPages.length > 0) {
      // Set a parent
      options.push({
        hasSubmenus: true,
        label: t['Make Child of'],
        icon: ListNested,
        // @ts-ignore
        onClick: () => {},
        children: childPages,
      });
    }

    return options;
  }, [page]);

  const meatballOptions = useMemo(() => {
    const options = [
      {
        label: t['Open'],
        icon: BoxArrowUpRight,
        onClick: () => {
          // See what kind of page this is
          const type = props.project.pages[props.uuid].autogenerate.enabled
            ? props.project.pages[props.uuid].autogenerate.type
            : 'page';
          let url;
          if (type === 'home') {
            url = `https://${props.project.project.github_org}.github.io/${props.project.project.slug}/`;
          } else if (type === 'event') {
            url = `https://${props.project.project.github_org}.github.io/${
              props.project.project.slug
            }/events/${props.project.pages[props.uuid].slug || props.uuid}`;
          } else {
            url = `https://${props.project.project.github_org}.github.io/${
              props.project.project.slug
            }/pages/${props.project.pages[props.uuid].slug || props.uuid}`;
          }
          return window.open(url, '_blank');
        },
      },
      {
        label: t['Edit'],
        icon: Pencil2Icon,
        onClick: () =>
          (window.location.href = `${window.location.href}/pages/${props.uuid}`),
      },
    ];

    // Allow re-enabling autogenerate if the page is
    // of type home or event
    if (
      props.project.pages[props.uuid] &&
      ['home', 'event'].includes(
        props.project.pages[props.uuid].autogenerate.type
      )
    ) {
      options.push({
        label: t['Re-Enable Auto-Generation'],
        icon: FiletypeHtml,
        // @ts-ignore
        onClick: () => props.onReEnableAutoGeneration(),
      });
    }

    if (
      props.project.pages[props.uuid] &&
      props.project.pages[props.uuid].autogenerate.type !== 'home'
    ) {
      options.push({
        label: t['Designate as Home Page'],
        icon: House,
        // @ts-ignore
        onClick: () => props.onDesignateHome(),
      });
    }

    // Re-parent
    const childPages: MeatballMenuItem[] = [];
    for (const pageId in props.project.pages) {
      if (pageId !== props.uuid) {
        const page = props.project.pages[pageId];

        childPages.push({
          label: page.title,
          // @ts-ignore
          onClick: () => props.onSetParent(pageId),
          id: pageId,
        });
      }
    }
    if (childPages.length > 0) {
      // Set a parent
      options.push({
        hasSubmenus: true,
        label: t['Make Child of'],
        icon: ListNested,
        // @ts-ignore
        onClick: () => {},
        children: childPages,
      });
    }

    // Make a page top level
    if (page.parent) {
      options.push({
        label: t['Move to Top Level'],
        icon: AlignTop,
        // @ts-ignore
        onClick: () => props.onMakeTopLevel(),
      });
    }

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
        // @ts-ignore
        onClick: async () => props.onDelete(),
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

  const parentCount = useMemo(() => {
    let count = 0;
    let parent = page.parent;
    while (parent) {
      count++;
      const parentPage = props.project.pages[parent];
      parent = parentPage.parent;
    }

    return count;
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
        {page.autogenerate.type === 'home' ? <HouseFill /> : <div />}
        {page.parent && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: (parentCount - 1) * 16,
            }}
          >
            <ArrowReturnRight />
          </div>
        )}
        {page.title}
      </Text>
      {page.autogenerate.enabled ? (
        <div className='page-autogen-pill'>{`${t['Auto-Generated']}-${
          t[page.autogenerate.type]
        }`}</div>
      ) : (
        <div />
      )}
      <span>{dateString}</span>
      <MeatballMenu
        buttons={
          page.autogenerate.enabled ? meatballOptionsAutoGen : meatballOptions
        }
        row={page}
      />
    </Box>
  );
};
