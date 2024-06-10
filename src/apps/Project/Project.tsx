import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { OpenInNewWindowIcon } from '@radix-ui/react-icons';
import type React from 'react';

import './Project.css';
import { Tabs } from '@components/Tabs/Tabs.tsx';

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
            <Button variant='outline'>{t['Settings']}</Button>
            <Button variant='outline'>{t['Tags']}</Button>
            <Button className='project-view-button'>
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
              component: <p>hello 1</p>,
            },
            {
              title: t['Pages'],
              component: <p>hello 2</p>,
            },
          ]}
        />
        <p>I contain the following events:</p>
        <ul>
          {props.project.events.map((ev) => (
            <li key={ev}>{ev}</li>
          ))}
        </ul>
      </div>
    </>
  );
};
