import type { ProjectData, Translations } from '@ty/Types.ts';
import * as Tooltip from '@radix-ui/react-tooltip';

import './ProjectCard.css';
import { Avatar } from '@components/Avatar/Avatar.tsx';
import { Skeleton } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

type ProjectCardProps = {
  project: ProjectData;
  i18n: Translations;
  getProjectData(org: string, repo: string): Promise<any>;
};

export const ProjectCard = (props: ProjectCardProps) => {
  const { t, lang } = props.i18n;

  const [project, setProject] = useState<ProjectData>(props.project);

  useEffect(() => {
    if (props.project) {
      props
        .getProjectData(
          props.project.project.github_org,
          props.project.project.slug
        )
        .then((data: ProjectData) => {
          if (data) {
            setProject(data);
          }
        });
    }
  }, [props.project]);

  return (
    <div className='project-card-container'>
      <a
        className='project-card-link'
        href={`/${lang}/projects/${project.project.github_org}+${project.project.slug}`}
      >
        <div className='project-card-header'>
          <h3>{project.project.title}</h3>
          <div className='project-card-description av-body-small'>
            {project.project.description}
          </div>
          <Skeleton
            loading={
              (project.project.updated_at || project.project.created_at) ===
              undefined
            }
          >
            <div className='project-card-last-edited av-body-small-italic'>
              {`${t['Last Edited']} ${new Date(
                project.project.updated_at || project.project.created_at
              ).toLocaleDateString('en-US')}`}
            </div>
          </Skeleton>
        </div>
        <div className='project-card-footer'>
          <Tooltip.Provider delayDuration={0}>
            <Skeleton loading={project.users === undefined}>
              {project.users &&
                project.users.map((u) => {
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
            </Skeleton>
          </Tooltip.Provider>
        </div>
      </a>
    </div>
  );
};
