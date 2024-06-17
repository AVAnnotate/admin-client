import type { AllProjects, Project, Translations } from '@ty/Types.ts';
import { Plus } from '@phosphor-icons/react/Plus';
import { Header } from './Header/Header.tsx';
import './Projects.css';
import { Button } from '@radix-ui/themes';
import { useState } from 'react';
import { ProjectFilter } from './Header/Header.tsx';
import { ProjectsGrid } from './ProjectsGrid/ProjectsGrid.tsx';
import { type SortFunction, Sorters } from '@components/SortAction/index.ts';

export interface ProjectsProps {
  projects: AllProjects;

  i18n: Translations;
}

export const Projects = (props: ProjectsProps) => {
  const { t, lang } = props.i18n;

  const [filter, setFilter] = useState(ProjectFilter.MINE);
  const [search, setSearch] = useState<string | undefined>();
  const [sort, setSort] = useState<'Name' | 'Oldest' | 'Newest'>('Name');

  const handleChangeFilter = (filter: ProjectFilter) => {
    setFilter(filter);
  };

  const handleChangeSearch = (value: string) => {
    setSearch(value);
  };

  const handleChangeSort = (sortFn: 'Name' | 'Oldest' | 'Newest') => {
    setSort(sortFn);
  };

  return (
    <div className='projects-container'>
      <div className='projects-header-bar'>
        <h1>{t['Projects']}</h1>
        <Button
          className='primary'
          onClick={() => (window.location.pathname = `/${lang}/projects/new`)}
        >
          <Plus />
          <div>{`${t['add']}`}</div>
        </Button>
      </div>
      <Header
        i18n={props.i18n}
        filter={filter}
        onChangeFilter={handleChangeFilter}
        onChangeSearch={handleChangeSearch}
        onChangeSort={handleChangeSort}
      />
      {props.projects && (
        <ProjectsGrid
          projects={
            filter === ProjectFilter.MINE
              ? props.projects.myProjects
                  .filter((p) =>
                    search
                      ? p.project.title.includes(search) ||
                        p.project.description.includes(search)
                      : true
                  )
                  .sort(Sorters[sort])
              : props.projects.sharedProjects.filter((p) =>
                  search
                    ? p.project.title.includes(search) ||
                      p.project.description.includes(search)
                    : true
                )
            // .sort(sort)
          }
          i18n={props.i18n}
        />
      )}
    </div>
  );
};
