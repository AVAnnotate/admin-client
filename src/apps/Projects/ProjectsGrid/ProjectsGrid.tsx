import { ProjectCard } from '@components/ProjectCard/ProjectCard.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import './ProjectsGrid.css';

interface ProjectsGridProps {
  projects: ProjectData[];

  i18n: Translations;
}

export const ProjectsGrid = (props: ProjectsGridProps) => {
  return (
    <div className='projects-grid-container' id='grid'>
      {props.projects.map((p) => (
        <ProjectCard
          project={p}
          i18n={props.i18n}
          key={`${p.project.github_org}+${p.project.slug}`}
        />
      ))}
    </div>
  );
};
