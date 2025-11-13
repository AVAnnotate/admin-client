import React, { useEffect, useMemo, useState } from 'react';
import './PageList.css';
import type { Page, ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { PageRow } from './PageRow.tsx';
import {
  makePageArray,
  getOrderFromPageArray,
  type OrderEntry,
} from '@lib/pages/reorder.ts';
import { navigate } from 'astro:transitions/client';

type RowState = {
  [key: string]: {
    uuid: string;
    hasChildren: boolean;
    expanded: boolean;
    parent: string | undefined;
    visible: boolean;
    canGoUp?: boolean;
    canGoDown?: boolean;
  };
};
interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const PageList: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const [pageOrder, setPageOrder] = useState(props.project.pageOrder);
  const [project, setProject] = useState(props.project);
  const [rowState, setRowState] = useState<RowState>({});

  const { t } = props.i18n;

  useEffect(() => {
    if (pageOrder) {
      let state: RowState = { ...rowState };

      const orderArray = makePageArray(project, pageOrder);

      orderArray.forEach((entry, idx) => {
        if (!state[entry.id]) {
          state[entry.id] = {
            uuid: entry.id,
            expanded: true,
            parent: entry.parent,
            visible: true,
            hasChildren: entry.children.length > 0,
          };
        }

        // Now determine how we can move this item
        state[entry.id].canGoDown = false;
        state[entry.id].canGoUp = false;
        if (entry.parent) {
          const parentEntry = orderArray.find((e) => e.id === entry.parent);
          if (parentEntry) {
            const childIdx = parentEntry.children.findIndex(
              (child) => child === entry.id
            );
            if (childIdx > 0 && parentEntry.children.length > 1) {
              state[entry.id].canGoUp = true;
            }
            if (
              childIdx < parentEntry.children.length - 1 &&
              parentEntry.children.length > 1
            ) {
              state[entry.id].canGoDown = true;
            }
          }
        } else {
          if (idx > 0 && orderArray.length > 1) {
            state[entry.id].canGoUp = true;
          }

          if (idx < orderArray.length - 1 && orderArray.length > 1) {
            state[entry.id].canGoDown = true;
          }
        }
      });

      setRowState(state);
    }
  }, [project, pageOrder]);

  const isChanged = useMemo(
    () => pageOrder !== props.project.pageOrder,
    [props.project.pageOrder, pageOrder]
  );

  const onSubmit = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${props.projectSlug}/pages/order`, {
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

  const handleDisableAutoGeneration = async (uuid: string) => {
    const copy: ProjectData = JSON.parse(JSON.stringify(project));

    const page = copy.pages[uuid];
    page.autogenerate.enabled = false;
    //If there is no content in the page, pre-populate with an embed of the related event, for convenience
    if (!page.content || !page.content.length) {
      const eventUuid = page.autogenerate.type_id;
      if (eventUuid || page.autogenerate.type === 'home') {
        page.autogenerate.type === 'home'
          ? (page.content = [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ])
          : (page.content = [
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                //@ts-ignore
                type: 'event',
                uuid: eventUuid,
                includes: ['media', 'annotations', 'description'],
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
            ]);
      }
    }
    setSaving(true);
    const res = await fetch(
      `/api/projects/${props.projectSlug}/pages/${uuid}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: page }),
      }
    );

    if (res.ok) {
      setProject(copy);
    }

    setSaving(false);
  };

  const handleReEnableAutoGeneration = async (uuid: string) => {
    const copy: ProjectData = JSON.parse(JSON.stringify(project));

    const page = copy.pages[uuid];
    if (['home', 'event'].includes(page.autogenerate.type)) {
      page.autogenerate.enabled = true;
      setSaving(true);
      const res = await fetch(
        `/api/projects/${props.projectSlug}/pages/${uuid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: page }),
        }
      );

      if (res.ok) {
        setProject(copy);
      }
    }

    setSaving(false);
  };

  const handleMakeTopLevel = async (uuid: string) => {
    const copy: ProjectData = JSON.parse(JSON.stringify(project));
    const copyOrder = [...(pageOrder as string[])];

    const page = copy.pages[uuid];
    setSaving(true);
    page.parent = undefined;
    const res = await fetch(
      `/api/projects/${props.projectSlug}/pages/${uuid}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: page }),
      }
    );

    if (res.ok) {
      // Move the page to the end
      const idx = copyOrder.findIndex((o) => o === uuid);
      if (idx > -1) {
        copyOrder.splice(idx, 1);
        copyOrder.push(uuid);

        const resOrder = await fetch(
          `/api/projects/${props.projectSlug}/pages/order`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: copyOrder }),
          }
        );

        if (resOrder.ok) {
          setPageOrder(copyOrder);
        }
      }

      setProject(copy);
    }

    setSaving(false);
  };

  const handleSetParent = async (uuid: string, parentId: string) => {
    const copy: ProjectData = JSON.parse(JSON.stringify(project));
    const copyOrder: string[] = JSON.parse(JSON.stringify(pageOrder));

    const page = copy.pages[uuid];
    setSaving(true);
    page.parent = parentId;
    const res = await fetch(
      `/api/projects/${props.projectSlug}/pages/${uuid}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: page }),
      }
    );

    if (res.ok) {
      // Update the copy order
      const childIndex = copyOrder.findIndex((i) => i === uuid);
      copyOrder.splice(childIndex, 1);

      const parentIndex = copyOrder.findIndex((i) => i === parentId);
      if (parentIndex === copyOrder.length - 1) {
        copyOrder.push(uuid);
      } else if (parentIndex > -1) {
        copyOrder.splice(parentIndex + 1, 0, uuid);
      }

      // Make the pageArray from the old project data
      let pageArray = makePageArray(copy, copyOrder as string[]);

      // Adjust page array
      let childEntry = pageArray.find((e) => e.id === uuid);
      let parentEntry = pageArray.find((e) => e.id === parentId);

      if (childEntry && parentEntry) {
        const newOrder = getOrderFromPageArray(pageArray);

        const resOrder = await fetch(
          `/api/projects/${props.projectSlug}/pages/order`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: newOrder }),
          }
        );

        if (resOrder.ok) {
          setPageOrder(newOrder);
        }
      }

      setProject(copy);
    }

    setSaving(false);
  };

  const handleDesignateHome = async (uuid: string) => {
    const copy: ProjectData = JSON.parse(JSON.stringify(project));
    let pageArray: OrderEntry[] = makePageArray(copy, pageOrder as string[]);

    let prevHome: Page | undefined;
    let prevHomeId: string | undefined;

    for (let id in copy.pages) {
      if (copy.pages[id].autogenerate.type === 'home') {
        prevHome = copy.pages[id];
        prevHomeId = id;
      }
    }
    const page = copy.pages[uuid];
    setSaving(true);

    page.autogenerate.enabled = false;
    page.autogenerate.type = 'home';
    page.parent = undefined;

    // Now set page order. Home should be first
    const idxCur = pageArray.findIndex((a) => a.id === uuid);
    if (idxCur > -1) {
      let cur = pageArray[idxCur];
      if (cur.parent) {
        let parent = pageArray.find((p) => p.id === cur.parent);
        if (parent) {
          const idx = parent.children.findIndex((i) => i === uuid);
          if (idx > -1) {
            parent.children.splice(idx, 1);
          }
          cur.parent = undefined;
        }
      }

      pageArray.splice(idxCur, 1);
      pageArray.unshift(cur);
      if (prevHome && prevHomeId !== uuid) {
        prevHome.autogenerate.enabled = false;
        prevHome.autogenerate.type = 'custom';
        const res = await fetch(
          `/api/projects/${props.projectSlug}/pages/${prevHomeId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ page: prevHome }),
          }
        );

        if (!res.ok) {
          setSaving(false);
        }
      }
      const res = await fetch(
        `/api/projects/${props.projectSlug}/pages/${uuid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: page }),
        }
      );

      if (res.ok) {
        const order = getOrderFromPageArray(pageArray);
        setPageOrder(order);
        setProject(copy);
        setSaving(false);
      }
    }

    setSaving(false);
  };

  const handleDeletePage = async (uuid: string) => {
    setSaving(true);
    const res = await fetch(
      `/api/projects/${props.projectSlug}/pages/${uuid}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      navigate(window.location.href, { history: 'replace' });
    }
    setSaving(false);
  };

  const currentArray = useMemo(
    () => makePageArray(project, pageOrder || []),
    [project, pageOrder]
  );

  const handleSetExpanded = (uuid: string, expanded: boolean) => {
    let copy: RowState = { ...rowState };
    copy[uuid].expanded = expanded;

    const entry = currentArray.find((e) => e.id === uuid);

    if (entry) {
      entry.allChildren.forEach((id) => {
        let state = copy[id];
        state.visible = expanded;
      });
    }

    setRowState(copy);
  };

  const handleUp = (uuid: string) => {
    let pageArray: OrderEntry[] = makePageArray(project, pageOrder as string[]);
    const targetPage: Page = project.pages[uuid];

    if (targetPage.parent) {
      let parent = pageArray.find((e) => e.id === targetPage.parent);

      if (parent) {
        const idx = parent.children.findIndex((i) => i === uuid);
        if (idx > 0) {
          const swap = parent.children[idx - 1];
          parent.children[idx - 1] = uuid;
          parent.children[idx] = swap;

          setPageOrder(getOrderFromPageArray(pageArray));
        }
      }
    } else {
      let topLevel = pageArray.filter((e) => !e.parent);
      const idx = topLevel.findIndex((e) => e.id === uuid);
      if (idx > 0) {
        const swap = topLevel[idx - 1];

        const swapIdx = pageArray.findIndex((e) => e.id === swap.id);
        const targetIndex = pageArray.findIndex((e) => e.id === uuid);
        pageArray[swapIdx] = { ...pageArray[targetIndex] };
        pageArray[targetIndex] = swap;

        const order = getOrderFromPageArray(pageArray);
        setPageOrder(order);
      }
    }
  };

  const handleDown = (uuid: string) => {
    let pageArray: OrderEntry[] = makePageArray(project, pageOrder as string[]);
    const targetPage: Page = project.pages[uuid];

    if (targetPage.parent) {
      let parent = pageArray.find((e) => e.id === targetPage.parent);

      if (parent) {
        const idx = parent.children.findIndex((i) => i === uuid);
        if (idx > -1) {
          const swap = parent.children[idx + 1];
          parent.children[idx + 1] = uuid;
          parent.children[idx] = swap;

          const order = getOrderFromPageArray(pageArray);
          setPageOrder(order);
        }
      }
    } else {
      let topLevel = pageArray.filter((e) => !e.parent);
      const idx = topLevel.findIndex((e) => e.id === uuid);
      if (idx > -1) {
        const swap = topLevel[idx + 1];

        const swapIdx = pageArray.findIndex((e) => e.id === swap.id);
        const targetIndex = pageArray.findIndex((e) => e.id === uuid);
        pageArray[swapIdx] = { ...pageArray[targetIndex] };
        pageArray[targetIndex] = swap;

        const order = getOrderFromPageArray(pageArray);

        setPageOrder(order);
      }
    }
  };

  return (
    <>
      {saving && <LoadingOverlay />}
      <div className='page-list'>
        <div className='page-list-box-container'>
          {pageOrder!.map((uuid, idx) => (
            <PageRow
              project={project}
              order={pageOrder as string[]}
              uuid={uuid}
              index={idx}
              i18n={props.i18n}
              key={uuid}
              visible={rowState[uuid] && rowState[uuid].visible}
              hasChildren={rowState[uuid] && rowState[uuid].hasChildren}
              expanded={rowState[uuid] && rowState[uuid].expanded}
              canGoUp={rowState[uuid] && (rowState[uuid].canGoUp as boolean)}
              canGoDown={
                rowState[uuid] && (rowState[uuid].canGoDown as boolean)
              }
              onDisableAutoGeneration={() => handleDisableAutoGeneration(uuid)}
              onReEnableAutoGeneration={() =>
                handleReEnableAutoGeneration(uuid)
              }
              onDesignateHome={() => handleDesignateHome(uuid)}
              onMakeTopLevel={() => handleMakeTopLevel(uuid)}
              onSetParent={(parentId) => handleSetParent(uuid, parentId)}
              onDelete={() => handleDeletePage(uuid)}
              onSetExpanded={(expanded) => handleSetExpanded(uuid, expanded)}
              onUp={() => handleUp(uuid)}
              onDown={() => handleDown(uuid)}
            />
          ))}
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
