import type { ProjectData } from '@ty/Types.ts';
import * as Tooltip from '@radix-ui/react-tooltip';

import './ProjectCard.css';
import { Avatar } from '@components/Avatar/Avatar.tsx';
import { Theme } from '@radix-ui/themes';

type ProjectCardProps = {
  project: ProjectData;
};

export const ProjectCard = (props: ProjectCardProps) => {
  return (
    <div className='project-card-container'>
      <div className='project-card-header'>
        <h3>{props.project.project.title}</h3>
        <div className='project-card-description av-body-small'>
          {props.project.project.description}
        </div>
      </div>
      <div className='project-card-footer'>
        {props.project.users.map((u) => {
          return (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Avatar
                    key={u.loginName}
                    name={u.loginName}
                    color={'--gray-300'}
                    avatar={u.avatarURL}
                    showBorder={true}
                  />
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className='TooltipContent' sideOffset={5}>
                    Add to library
                    <Tooltip.Arrow className='TooltipArrow' />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })}
      </div>
    </div>
  );
};
