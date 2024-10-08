import type { ProjectData, Translations } from '@ty/Types.ts';
import * as Tooltip from '@radix-ui/react-tooltip';

import './ProjectCard.css';
import { Avatar } from '@components/Avatar/Avatar.tsx';

type ProjectCardProps = {
  project: ProjectData;
  i18n: Translations;
};

export const ProjectCard = (props: ProjectCardProps) => {
  const { t, lang } = props.i18n;

  return (
    <div className='project-card-container'>
      <a
        className='project-card-link'
        href={`/${lang}/projects/${props.project.project.github_org}+${props.project.project.slug}`}
      >
        <div className='project-card-header'>
          <h3>{props.project.project.title}</h3>
          <div className='project-card-description av-body-small'>
            {props.project.project.description}
          </div>
          <div className='project-card-last-edited av-body-small-italic'>
            {`${t['Last Edited']} ${new Date(
              props.project.project.updated_at ||
                props.project.project.created_at
            ).toLocaleDateString('en-US')}`}
          </div>
        </div>
        <div className='project-card-footer'>
          <Tooltip.Provider delayDuration={0}>
            {props.project.users.map((u) => {
              return (
                <Tooltip.Root key={u.login_name}>
                  {/* React expects a key on the trigger too due
                      to the way Radix renders the tooltip. */}
                  <Tooltip.Trigger asChild key={u.login_name}>
                    <div className='project-card-avatar-container'>
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
                      className='project-card-tooltip-content'
                      sideOffset={5}
                    >
                      {u.name || u.login_name}
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
