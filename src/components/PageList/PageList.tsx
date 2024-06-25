import React, { useMemo, useState } from 'react';
import './PageList.css';
import type { Page, ProjectData, Translations } from '@ty/Types.ts';
import { Box, Button, Text } from '@radix-ui/themes';
import { BoxArrowUpRight, GripVertical, Trash } from 'react-bootstrap-icons';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { changeOrder, sortPages, type PageWithUuid } from '@lib/pages/index.ts';

interface Props {
  i18n: Translations;
  project: ProjectData;
}

interface DraggedPage {
  uuid: string;
  originalIndex: number;
  hoverIndex: number;
}

export const PageList: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);
  const [pages, setPages] = useState<string[]>(sortPages(props.project.pages));

  const dateStrings = useMemo(() => {
    return pages.map((uuid) => {
      const page = props.project.pages[uuid];

      if (page.updated_at) {
        const dateStr = new Date(page.updated_at).toLocaleDateString();
        return `${t['Last edited at']} ${dateStr}`;
      } else {
        const dateStr = new Date(page.created_at).toLocaleDateString();
        return `${t['Added']} ${dateStr}`;
      }
    });
  }, [pages]);

  return (
    <div className='page-list'>
      <div className='page-list-top-bar'>
        <span>{t['All Pages']}</span>
        <Button className='primary'>
          <PlusIcon />
          {t['Add']}
        </Button>
      </div>
      <div className='page-list-box-container'>
        {Object.keys(props.project.pages).map((uuid, idx) => {
          const page = props.project.pages[uuid];

          return (
            <Box
              className={`page-list-box ${
                pickedUp?.hoverIndex === idx ? 'page-list-box-hovered' : ''
              }`}
              draggable
              onDragStart={() =>
                setPickedUp({
                  uuid,
                  originalIndex: idx,
                  hoverIndex: idx,
                })
              }
              onDragOver={() => {
                if (pickedUp) {
                  setPickedUp({
                    ...pickedUp,
                    hoverIndex: idx,
                  });
                  // TODO
                  // setPages(changeOrder(
                  //   props.project.pages,
                  //   pickedUp.uuid,

                  // ));
                }
              }}
              onDragEnd={() => {
                if (pickedUp) {
                  setPickedUp(null);
                }
              }}
              height='56px'
              width='100%'
            >
              <GripVertical />
              <Text weight='bold'>
                {page.parent && '-- '}
                {page.title}
              </Text>
              <span>{dateStrings[idx]}</span>
              <MeatballMenu
                buttons={[
                  {
                    label: t['Open'],
                    icon: BoxArrowUpRight,
                    onClick: () => {},
                  },
                  {
                    label: t['Edit'],
                    icon: Pencil2Icon,
                    onClick: () =>
                      (window.location.href = `${window.location.href}/pages/${uuid}`),
                  },
                  {
                    label: t['Delete'],
                    icon: Trash,
                    onClick: async () => {
                      await fetch(
                        `/api/projects/${props.project.project.gitHubOrg}+${props.project.project.slug}/events/${uuid}`,
                        {
                          method: 'DELETE',
                        }
                      );

                      window.location.reload();
                    },
                  },
                ]}
                row={page}
              />
            </Box>
          );
        })}
      </div>
    </div>
  );
};
