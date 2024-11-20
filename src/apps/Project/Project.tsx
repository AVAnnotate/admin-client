import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import {
  DownloadIcon,
  GearIcon,
  Pencil2Icon,
  PlusIcon,
} from '@radix-ui/react-icons';
import type React from 'react';
import {
  BoxArrowUpRight,
  FileEarmarkArrowUp,
  FileEarmarkText,
  Sliders2Vertical,
  Tag,
  Trash,
  VolumeUp,
} from 'react-bootstrap-icons';

import './Project.css';
import { PageList } from '@components/PageList/index.ts';
import { Tabs } from '@components/Tabs/Tabs.tsx';
import { Table } from '@components/Table/Table.tsx';
import { useMemo, useState } from 'react';
import { DeleteEventModal } from '@components/DeleteEventModal/DeleteEventModal.tsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { exportEvents } from '@lib/events/export.ts';
import { BuildStatus } from '@components/BuildStatus/BuildStatus.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

interface EventWithUuid extends Event {
  uuid: string;
}

export const Project: React.FC<Props> = (props) => {
  const [deleteUuid, setDeleteUuid] = useState<null | string>(null);

  const { lang, t } = props.i18n;

  // Add uuid fields to the event objects so we
  // can still use the onClick row handlers below.
  const eventsWithUuids = useMemo(
    () =>
      Object.entries(props.project.events!).map((entry) => ({
        uuid: entry[0],
        ...entry[1],
      })),
    [props.project.events]
  );

  const handleNavToSettings = () => {
    window.location.pathname = `/${lang}/projects/${props.projectSlug}/settings`;
  };

  return (
    <>
      {deleteUuid && (
        <DeleteEventModal
          annotations={props.project.annotations}
          eventUuid={deleteUuid}
          i18n={props.i18n}
          onAfterSave={() => window.location.reload()}
          onCancel={() => setDeleteUuid(null)}
          projectSlug={props.projectSlug}
        />
      )}
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          { label: props.project.project.title, link: '' },
        ]}
      />
      <div className='project-container'>
        <div className='project-top-bar'>
          <h2 className='project-title'>
            {props.project.project.title}
            <BuildStatus projectSlug={props.projectSlug} i18n={props.i18n} />
          </h2>
          <div className='project-top-bar-buttons'>
            <a href={`/${lang}/projects/${props.projectSlug}/tags`}>
              <Button className='primary'>
                <Tag />
                {t['Tags']}
              </Button>
            </a>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button className='settings-button'>
                  <GearIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className='dropdown-content'>
                  <DropdownMenu.Item
                    className='dropdown-item project-dropdown-item'
                    onClick={handleNavToSettings}
                  >
                    {t['Settings']}
                    <Sliders2Vertical />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className='dropdown-item project-dropdown-item'
                    onClick={() =>
                      window.open(
                        `https://${props.project.project.github_org}.github.io/${props.project.project.slug}`,
                        '_blank'
                      )
                    }
                  >
                    {t['View']}
                    <BoxArrowUpRight />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
        <p>{props.project.project.description}</p>
        <Tabs
          tabs={[
            {
              count: Object.keys(props.project.events).length,
              icon: VolumeUp,
              title: t['Events'],
              component: (
                <Table
                  emptyText={t['No events have been added']}
                  headerButtons={[
                    {
                      label: t['CSV'],
                      icon: DownloadIcon,
                      variant: 'outline',
                      onClick: () => {
                        exportEvents(
                          props.project.project.title,
                          Object.keys(props.project.events).map(
                            (k) => props.project.events[k]
                          )
                        );
                      },
                    },
                    {
                      label: t['import'],
                      icon: FileEarmarkArrowUp,
                      onClick: () =>
                        (window.location.pathname = `${window.location.pathname}/events/import`),
                    },
                    {
                      label: t['add'],
                      icon: PlusIcon,
                      onClick: () =>
                        (window.location.pathname = `${window.location.pathname}/events/new`),
                    },
                  ]}
                  items={eventsWithUuids}
                  onRowClick={(item) =>
                    (window.location.pathname = `${window.location.pathname}/events/${item.uuid}`)
                  }
                  rows={[
                    {
                      title: t['Name'],
                      property: 'label',
                      sortable: true,
                    },
                    {
                      title: t['Type'],
                      property: 'item_type',
                    },
                    {
                      title: t['Added'],
                      property: (item: Event) =>
                        `${t['Added']} ${new Date(
                          item.created_at
                        ).toLocaleDateString()}`,
                      sortable: true,
                    },
                  ]}
                  rowButtons={[
                    {
                      label: t['Open in new tab'],
                      icon: BoxArrowUpRight,
                      onClick: (item: EventWithUuid) =>
                        window.open(
                          `${window.location.href}/events/${item.uuid}`,
                          '_blank'
                        ),
                    },
                    {
                      label: t['Edit Settings'],
                      icon: Pencil2Icon,
                      onClick: (item: EventWithUuid) =>
                        (window.location.href = `${window.location.href}/events/${item.uuid}/edit`),
                    },
                    {
                      label: t['Delete'],
                      icon: Trash,
                      onClick: async (item: EventWithUuid) =>
                        setDeleteUuid(item.uuid),
                    },
                  ]}
                  searchAttribute='label'
                  showHeaderRow={false}
                  title={t['All Events']}
                />
              ),
            },
            {
              keepMounted: true,
              icon: FileEarmarkText,
              count: Object.keys(props.project.pages).length,
              title: t['Pages'],
              component: (
                <PageList
                  i18n={props.i18n}
                  project={props.project}
                  projectSlug={props.projectSlug}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  );
};
