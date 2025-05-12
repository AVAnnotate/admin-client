import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { makePageArray } from '@lib/pages/reorder.ts';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Box, Text, IconButton } from '@radix-ui/themes';
import { Icon } from '@radix-ui/themes/dist/esm/components/callout.js';
import type { ProjectData, Translations } from '@ty/Types.ts';
import type { DraggedPage, MeatballMenuItem } from '@ty/ui.ts';
import { useMemo } from 'react';
import {
  ArrowReturnRight,
  BoxArrowUpRight,
  CaretRightFill,
  CaretDownFill,
  Trash,
  FiletypeHtml,
  AlignTop,
  ListNested,
  House,
  HouseFill,
  ArrowUp,
  ArrowDown,
} from 'react-bootstrap-icons';

const truncate = (str: string) => {
  if (str.length <= 36) {
    return str;
  }

  return `${str.slice(0, 36)}...`;
};

interface Props {
  project: ProjectData;
  order: string[];
  uuid: string;
  index: number;
  i18n: Translations;
  hasChildren: boolean;
  expanded: boolean;
  visible: boolean;
  canGoUp: boolean;
  canGoDown: boolean;
  onDisableAutoGeneration(): void;
  onReEnableAutoGeneration(): void;
  onDesignateHome(): void;
  onMakeTopLevel(): void;
  onSetParent(pageId: string): void;
  onDelete(): void;
  onSetExpanded(expanded: boolean): void;
  onUp(): void;
  onDown(): void;
}

export const PageRow: React.FC<Props> = (props) => {
  const page = useMemo(
    () => props.project.pages![props.uuid],
    [props.project, props.uuid]
  );

  const { t } = props.i18n;

  const meatballOptionsAutoGen = useMemo(() => {
    const pageArray = makePageArray(props.project, props.order);

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
        label: t['Move level up'],
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

        // Cannot parent a page to one of its children
        const entry = pageArray.find((a) => a.id === pageId);
        if (entry) {
          if (!entry.allChildren.includes(props.uuid)) {
            childPages.push({
              label: page.title,
              icon: ListNested,
              // @ts-ignore
              onClick: () => props.onSetParent(pageId),
            });
          }
        }
      }
    }
    if (childPages.length > 0) {
      // Set a parent
      options.push({
        hasSubmenus: true,
        label: t['Move level down'],
        icon: ListNested,
        // @ts-ignore
        onClick: () => {},
        children: childPages,
      });
    }

    return options;
  }, [page]);

  const meatballOptions = useMemo(() => {
    const pageArray = makePageArray(props.project, props.order);
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
          (window.location.href = `${
            window.location.origin + window.location.pathname
          }/pages/${props.uuid}`),
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

        // Cannot parent a page to one of its children
        const entry = pageArray.find((a) => a.id === pageId);
        if (entry) {
          if (!entry.allChildren.includes(props.uuid)) {
            childPages.push({
              label: page.title,
              icon: ListNested,
              // @ts-ignore
              onClick: () => props.onSetParent(pageId),
            });
          }
        }
      }
    }
    if (childPages.length > 0) {
      // Set a parent
      options.push({
        hasSubmenus: true,
        label: t['Move level down'],
        icon: ListNested,
        // @ts-ignore
        onClick: () => {},
        children: childPages,
      });
    }

    // Make a page top level
    if (page.parent) {
      options.push({
        label: t['Move level up'],
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

  const arrowState = useMemo(() => {
    let state = 'none';
    if (props.hasChildren) {
      if (props.expanded) {
        state = 'down';
      } else {
        state = 'right';
      }
    }

    return state;
  }, [props.expanded, props.hasChildren]);

  return (
    <Box
      className={`page-list-box ${props.visible ? '' : 'page-list-box-hidden'}`}
      key={props.uuid}
      height='56px'
      width='100%'
    >
      <Text className='page-title' weight='bold'>
        {arrowState === 'none' ? (
          <div className='row-arrow-container' />
        ) : arrowState === 'down' ? (
          <div
            className='row-arrow-container'
            onClick={() => props.onSetExpanded(false)}
          >
            <CaretDownFill />
          </div>
        ) : (
          <div
            className='row-arrow-container'
            onClick={() => props.onSetExpanded(true)}
          >
            <CaretRightFill />
          </div>
        )}
        {page.autogenerate.type === 'home' ? (
          <HouseFill />
        ) : (
          <div style={{ width: 16 }} />
        )}
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
        {truncate(page.title)}
      </Text>
      {page.autogenerate.enabled ? (
        <div className='page-autogen-pill'>{t['Auto-generated']}</div>
      ) : (
        <div />
      )}
      <span>{dateString}</span>
      <div className='page-row-reorder'>
        <IconButton
          className='page-row-reorder-button'
          disabled={!props.canGoUp}
          onClick={props.onUp}
        >
          <ArrowUp color='white' />
        </IconButton>
        <IconButton
          className='page-row-reorder-button'
          disabled={!props.canGoDown}
          onClick={props.onDown}
        >
          <ArrowDown color='white' />
        </IconButton>
      </div>
      <MeatballMenu
        buttons={
          page.autogenerate.enabled ? meatballOptionsAutoGen : meatballOptions
        }
        row={page}
      />
    </Box>
  );
};
