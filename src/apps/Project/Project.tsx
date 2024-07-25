import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import {
  DownloadIcon,
  GearIcon,
  OpenInNewWindowIcon,
  Pencil2Icon,
  PlusIcon,
} from '@radix-ui/react-icons';
import type React from 'react';
import {
  BoxArrowUpRight,
  FileEarmarkArrowUp,
  Tag,
  Trash,
} from 'react-bootstrap-icons';

import './Project.css';
import { PageList } from '@components/PageList/index.ts';
import { Tabs } from '@components/Tabs/Tabs.tsx';
import { Table } from '@components/Table/Table.tsx';
import { useMemo } from 'react';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

interface EventWithUuid extends Event {
  uuid: string;
}

export const Project: React.FC<Props> = (props) => {
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

  const handleNavToTags = () => {
    window.location.pathname = `/${lang}/projects/${props.projectSlug}/tags`;
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          { label: props.project.project.title, link: '' },
        ]}
      />
      <div className='project-container'>
        <div className='project-top-bar'>
          <h2 className='project-title'>{props.project.project.title}</h2>
          <div className='project-top-bar-buttons'>
            <a href={`/${lang}/projects/${props.projectSlug}/settings`}>
              <Button className='outline' variant='outline'>
                <GearIcon />
                {t['Settings']}
              </Button>
            </a>
            <Button
              className='outline'
              variant='outline'
              onClick={handleNavToTags}
            >
              <Tag />
              {t['Tags']}
            </Button>
            <Button className='primary'>
              <span>{t['View']}</span>
              <OpenInNewWindowIcon color='white' />
            </Button>
          </div>
        </div>
        <p>{props.project.project.description}</p>
        <Tabs
          tabs={[
            {
              title: t['Events'],
              component: (
                <Table
                  emptyText={t['No events have been added']}
                  headerButtons={[
                    {
                      label: t['CSV'],
                      icon: DownloadIcon,
                      variant: 'outline',
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
                      label: t['Open'],
                      icon: BoxArrowUpRight,
                      onClick: () => {},
                    },
                    {
                      label: t['Edit'],
                      icon: Pencil2Icon,
                      onClick: (item: EventWithUuid) =>
                        (window.location.href = `${window.location.href}/events/${item.uuid}`),
                    },
                    {
                      label: t['Delete'],
                      icon: Trash,
                      onClick: async (item: EventWithUuid) => {
                        await fetch(
                          `/api/projects/${props.project.project.github_org}+${props.project.project.slug}/events/${item.uuid}`,
                          {
                            method: 'DELETE',
                          }
                        );

                        window.location.reload();
                      },
                    },
                  ]}
                  searchAttribute='label'
                  showHeaderRow={false}
                  title={t['All Events']}
                />
              ),
            },
            {
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
