import React, { useMemo, useState } from 'react';
import './PageList.css';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Box, Button, Text } from '@radix-ui/themes';
import { BoxArrowUpRight, GripVertical, Trash } from 'react-bootstrap-icons';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';

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
  const [saving, setSaving] = useState(false);
  const [pageOrder, setPageOrder] = useState(props.project.pageOrder);

  const { t } = props.i18n;

  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  const isChanged = useMemo(
    () => pageOrder !== props.project.pageOrder,
    [props.project.pageOrder, pageOrder]
  );

  const dateStrings = useMemo(() => {
    return pageOrder.map((uuid) => {
      const page = props.project.pages[uuid];

      if (page.updated_at) {
        const dateStr = new Date(page.updated_at).toLocaleDateString();
        return `${t['Last edited at']} ${dateStr}`;
      } else {
        const dateStr = new Date(page.created_at).toLocaleDateString();
        return `${t['Added']} ${dateStr}`;
      }
    });
  }, [props.project]);

  const projectSlug = useMemo(
    () => `${props.project.project.github_org}+${props.project.project.slug}`,
    [props.project]
  );

  const onDrop = async () => {
    if (pickedUp) {
      // ignore if we're dropping in the same spot it came from
      if (pickedUp.hoverIndex === pickedUp.originalIndex) {
        return setPickedUp(null);
      }

      const selectedPage = props.project.pages[pickedUp.uuid];

      let newArray = pageOrder.filter((k) => k !== pickedUp.uuid);

      if (selectedPage.parent) {
        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid);
      } else {
        const children = pageOrder.filter(
          (key) => props.project.pages[key].parent === pickedUp.uuid
        );

        newArray = newArray.filter((k) => !children.includes(k));

        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid, ...children);
      }

      setPageOrder(newArray);
    }
  };

  const onSubmit = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${projectSlug}/pages/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: pageOrder }),
    });

    const data = await res.json();

    setPageOrder(data.order);
    setSaving(false);
  };

  return (
    <>
      {saving && <LoadingOverlay />}
      <div className='page-list'>
        <div className='page-list-top-bar'>
          <span>{t['All Pages']}</span>
          <Button
            className='primary'
            onClick={() =>
              (window.location.pathname = `${window.location.pathname}/pages/new`)
            }
          >
            <PlusIcon />
            {t['Add']}
          </Button>
        </div>
        <div className='page-list-box-container'>
          {pageOrder.map((uuid, idx) => {
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
                onDrop={async () => await onDrop()}
                onDragEnd={() => setPickedUp(null)}
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
                          `/api/projects/${props.project.project.github_org}+${props.project.project.slug}/events/${uuid}`,
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
        <BottomBar>
          <div className='page-list-bottom-bar'>
            <Button
              className='primary'
              disabled={!isChanged}
              onClick={onSubmit}
            >
              {t['save']}
            </Button>
          </div>
        </BottomBar>
      </div>
    </>
  );
};
