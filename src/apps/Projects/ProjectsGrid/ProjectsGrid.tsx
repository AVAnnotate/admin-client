import { ProjectCard } from '@components/ProjectCard/ProjectCard.tsx';
import type { ProjectData, Translations, UserInfo } from '@ty/Types.ts';
import './ProjectsGrid.css';
import type { ProjectFilter } from '../Header/Header.tsx';

interface ProjectsGridProps {
  projects: ProjectData[];

  i18n: Translations;

  filter: ProjectFilter;

  userInfo: UserInfo;

  getProjectData(org: string, repo: string): Promise<any>;
}

export const ProjectsGrid = (props: ProjectsGridProps) => {
  return (
    <div className='projects-grid-container' id='grid'>
      {props.projects.map((p) => (
        <ProjectCard
          project={p}
          i18n={props.i18n}
          filter={props.filter}
          userInfo={props.userInfo}
          getProjectData={props.getProjectData}
          key={`${p.project.github_org}+${p.project.slug}`}
        />
      ))}
    </div>
  );
};
