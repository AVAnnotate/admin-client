import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import type React from 'react';
import {
  PencilSquare,
  Window,
  ThreeDots,
  ChevronLeft,
} from 'react-bootstrap-icons';

import './Project.css';
import { PageList } from '@components/PageList/index.ts';
import { Tabs } from '@components/Tabs/Tabs.tsx';
import { useMemo, useState } from 'react';
import { DeleteEventModal } from '@components/DeleteEventModal/DeleteEventModal.tsx';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Avatar } from '@components/Avatar/Avatar.tsx';
import { DataManager } from '@components/DataManager/DataManager.tsx';

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
      <div className='project-container'>
        <div
          className='project-back'
          onClick={() =>
            (window.location.href = `/${props.i18n.lang}/projects`)
          }
        >
          <ChevronLeft />
          <div className='av-label-bold'>{t['All Projects']}</div>
        </div>
        <div className='project-top-bar'>
          <h2 className='project-title'>{props.project.project.title}</h2>
          <div className='project-top-bar-buttons'>
            <div className='avatar-list'>
              <Tooltip.Provider delayDuration={0}>
                {props.project.users &&
                  props.project.users.map((u) => {
                    return (
                      <Tooltip.Root key={u.login_name}>
                        {/* React expects a key on the trigger too due
                      to the way Radix renders the tooltip. */}
                        <Tooltip.Trigger asChild key={u.login_name}>
                          <div className='avatar-container'>
                            <Avatar
                              name={u.login_name}
                              color={'--gray-300'}
                              avatar={u.avatar_url}
                              showBorder={true}
                              disabled={u.not_accepted}
                            />
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className='avatar-tooltip-content'
                            sideOffset={5}
                          >
                            {u.name || u.login_name}
                            <Tooltip.Arrow className='avatar-tooltip-content-arrow' />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    );
                  })}
              </Tooltip.Provider>
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button className='settings-button'>
                  <ThreeDots />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className='dropdown-content'>
                  <DropdownMenu.Item
                    className='dropdown-item project-dropdown-item'
                    onClick={handleNavToSettings}
                  >
                    <PencilSquare />
                    {t['Edit Project Settings']}
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
                    <Window />
                    {t['View Website']}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
        <div className='project-tabs'>
          <Tabs
            tabs={[
              {
                keepMounted: true,
                title: t['Data Manager'],
                component: (
                  <DataManager
                    i18n={props.i18n}
                    project={props.project}
                    projectSlug={props.projectSlug}
                  />
                ),
              },
              {
                keepMounted: true,
                title: t['Site Builder'],
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
      </div>
    </>
  );
};
