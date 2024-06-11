import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import {
  DownloadIcon,
  GearIcon,
  OpenInNewWindowIcon,
  Pencil2Icon,
  PlusIcon
} from '@radix-ui/react-icons';
import type React from 'react';
import { BoxArrowUpRight, FileEarmarkArrowUp, Tag, Trash } from 'react-bootstrap-icons';

import './Project.css';
import { Tabs } from '@components/Tabs/Tabs.tsx';
import { Table } from '@components/Table/Table.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
}

export const Project: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

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
            <Button className='outline' variant='outline'>
              <GearIcon />
              {t['Settings']}
            </Button>
            <Button className='outline' variant='outline'>
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
                      variant: 'outline'
                    },
                    {
                      label: t['import'],
                      icon: FileEarmarkArrowUp
                    },
                    {
                      label: t['add'],
                      icon: PlusIcon
                    }
                  ]}
                  items={props.project.events}
                  rows={[{
                    title: t['Name'],
                    property: 'label',
                    sortable: true
                  }, {
                    title: t['Type'],
                    property: 'item_type'
                  }, {
                    title: t['Added'],
                    property: (item: Event) => `${t['Added']} ${new Date(item.created_at).toLocaleDateString()}`,
                    sortable: true
                  }]}
                  rowButtons={[
                    {
                      label: t['Open'],
                      icon: BoxArrowUpRight,
                      onClick: () => { }
                    },
                    {
                      label: t['Edit'],
                      icon: Pencil2Icon,
                      onClick: () => { }
                    },
                    {
                      label: t['Delete'],
                      icon: Trash,
                      onClick: () => { }
                    }
                  ]}
                  searchAttribute='label'
                  showHeaderRow={false}
                  title={t['All Events']}
                />
              )
            },
            {
              title: t['Pages'],
              component: <p>todo</p>,
            },
          ]}
        />
      </div>
    </>
  );
};
