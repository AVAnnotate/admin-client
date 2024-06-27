import React, { useMemo, useState } from 'react';
import './PageList.css';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Box, Button, Text } from '@radix-ui/themes';
import { BoxArrowUpRight, GripVertical, Trash } from 'react-bootstrap-icons';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';

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

  const dateStrings = useMemo(() => {
    return props.project.pageOrder.map((uuid) => {
      const page = props.project.pages[uuid];

      if (page.updated_at) {
        const dateStr = new Date(page.updated_at).toLocaleDateString();
        return `${t['Last edited at']} ${dateStr}`;
      } else {
        const dateStr = new Date(page.created_at).toLocaleDateString();
        return `${t['Added']} ${dateStr}`;
      }
    });
  }, [props.project.pages]);

  const onDrop = () => {
    if (pickedUp) {
      let newSortedPages: string[] = [...props.project.pageOrder];

      newSortedPages.splice(pickedUp.originalIndex, 1);
      newSortedPages.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid);

      const newPages = { ...props.project.pages };

      // track the order of top-level pages
      let parentOrderCounter = 1;

      // track the order of child pages within each parent
      // (this is reset to 1 when we get to the next parent page)
      let childOrderCounter = 1;

      newSortedPages.forEach((uuid, idx) => {
        const page = props.project.pages[uuid];

        // If a page is a child page, we need to find the most recent page *before*
        // it in the array that's not a child. That page is its new parent.
        if (page.parent) {
          const parent = newSortedPages
            .slice(0, idx)
            .findLast((key) => !props.project.pages[key].parent);

          if (parent) {
            newPages[uuid] = {
              ...page,
              parent,
              order: childOrderCounter,
            };

            childOrderCounter += 1;
          } else {
            console.log(
              'No parent found for page. Something weird must have happened.'
            );
          }
        } else {
          // reset the child counter because this is not a child page
          childOrderCounter = 1;
          newPages[uuid] = {
            ...page,
            order: parentOrderCounter,
          };
          parentOrderCounter += 1;
        }
      });
      console.log(newPages);
    }
  };

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
        {props.project.pageOrder.map((uuid, idx) => {
          const page = props.project.pages[uuid];

          return (
            <Box
              className={`page-list-box ${
                pickedUp?.hoverIndex === idx ? 'page-list-box-hovered' : ''
              }`}
              draggable
              key={uuid}
              onDragStart={(ev) => {
                setPickedUp({
                  uuid: uuid,
                  originalIndex: idx,
                  hoverIndex: idx,
                });
              }}
              onDragOver={(ev) => {
                ev.preventDefault();
                if (pickedUp) {
                  setPickedUp({
                    ...pickedUp,
                    hoverIndex: idx,
                  });
                }
              }}
              onDrop={onDrop}
              onDragEnd={() => {
                setPickedUp(null);
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
