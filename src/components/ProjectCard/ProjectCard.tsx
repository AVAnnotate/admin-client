import type { ProjectData } from '@ty/Types.ts';
import * as Tooltip from '@radix-ui/react-tooltip';

import './ProjectCard.css';
import { Avatar } from '@components/Avatar/Avatar.tsx';

type ProjectCardProps = {
  project: ProjectData;
  lang: string;
};

export const ProjectCard = (props: ProjectCardProps) => {
  return (
    <div className='project-card-container'>
      <a
        className='project-card-link'
        href={`/${props.lang}/projects/${props.project.project.gitHubOrg}-${props.project.project.slug}`}
      >
        <div className='project-card-header'>
          <h3>{props.project.project.title}</h3>
          <div className='project-card-description av-body-small'>
            {props.project.project.description}
          </div>
        </div>
        <div className='project-card-footer'>
          <Tooltip.Provider delayDuration={0}>
            {props.project.users.map((u) => {
              return (
                <Tooltip.Root key={u.loginName}>
                  <Tooltip.Trigger asChild>
                    <div className='project-card-avatar-container'>
                      <Avatar
                        name={u.loginName}
                        color={'--gray-300'}
                        avatar={u.avatarURL}
                        showBorder={true}
                      />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className='project-card-tooltip-content'
                      sideOffset={5}
                    >
                      {u.name || u.loginName}
                      <Tooltip.Arrow className='TooltipArrow' />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </Tooltip.Provider>
        </div>
      </a>
    </div>
  );
};
