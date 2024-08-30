import React, { useMemo, useState } from 'react';
import './PageList.css';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import type { DraggedPage } from '@ty/ui.ts';
import { PageRow } from './PageRow.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const PageList: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const [pageOrder, setPageOrder] = useState(props.project.pageOrder);
  const [project, setProject] = useState(props.project);

  const { t } = props.i18n;

  const [pickedUp, setPickedUp] = useState<DraggedPage | null>(null);

  const isChanged = useMemo(
    () => pageOrder !== props.project.pageOrder,
    [props.project.pageOrder, pageOrder]
  );

  const onDrop = async () => {
    if (pickedUp) {
      // ignore if we're dropping in the same spot it came from
      if (pickedUp.hoverIndex === pickedUp.originalIndex) {
        return setPickedUp(null);
      }

      const selectedPage = project.pages![pickedUp.uuid];

      let newArray = pageOrder!.filter((k) => k !== pickedUp.uuid);

      if (selectedPage.parent) {
        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid);
      } else {
        const children = pageOrder!.filter(
          (key) => project.pages![key].parent === pickedUp.uuid
        );

        newArray = newArray.filter((k) => !children.includes(k));

        newArray.splice(pickedUp.hoverIndex + 1, 0, pickedUp.uuid, ...children);
      }

      setPageOrder(newArray);
    }
  };

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
    let copy: ProjectData = JSON.parse(JSON.stringify(project));

    const page = copy.pages[uuid];
    page.autogenerate.enabled = false;
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
    let copy: ProjectData = JSON.parse(JSON.stringify(project));

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

  const handleDeletePage = async (uuid: string) => {
    setSaving(true);
    const res = await fetch(
      `/api/projects/${props.projectSlug}/pages/${uuid}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      window.location.reload();
    }
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
          {pageOrder!.map((uuid, idx) => (
            <PageRow
              project={project}
              uuid={uuid}
              index={idx}
              pickedUp={pickedUp}
              setPickedUp={setPickedUp}
              i18n={props.i18n}
              onDrop={onDrop}
              key={uuid}
              onDisableAutoGeneration={() => handleDisableAutoGeneration(uuid)}
              onReEnableAutoGeneration={() =>
                handleReEnableAutoGeneration(uuid)
              }
              onDelete={() => handleDeletePage(uuid)}
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
