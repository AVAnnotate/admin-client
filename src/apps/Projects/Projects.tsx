import type { AllProjects, Translations } from '@ty/Types.ts';
import { Plus } from '@phosphor-icons/react/Plus';
import { Header } from './Header/Header.tsx';
import './Projects.css';
import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ProjectFilter } from './Header/Header.tsx';
import { ProjectsGrid } from './ProjectsGrid/ProjectsGrid.tsx';
import { Sorters } from '@components/SortAction/index.ts';

export interface ProjectsProps {
  repos: { org: string; repo: string }[];

  i18n: Translations;
}

export const Projects = (props: ProjectsProps) => {
  const { t, lang } = props.i18n;

  const [filter, setFilter] = useState(ProjectFilter.MINE);
  const [search, setSearch] = useState<string | undefined>();
  const [sort, setSort] = useState<'Name' | 'Oldest' | 'Newest'>('Name');
  const [projects, setProjects] = useState<AllProjects | undefined>();

  const handleChangeFilter = (filter: ProjectFilter) => {
    setFilter(filter);
  };

  const handleChangeSearch = (value: string) => {
    setSearch(value);
  };

  const handleChangeSort = (sortFn: 'Name' | 'Oldest' | 'Newest') => {
    setSort(sortFn);
  };

  useEffect(() => {
    if (props.repos) {
      const allProjects: AllProjects = [];

      for (let i = 0; i < props.repos.length; i++) {
        await;
      }
    }
    const projs: AllProjects = JSON.parse(JSON.stringify(props.projects));

    if (props.projects) {
      if (sort === 'Name') {
        projs.myProjects.sort(Sorters['Name']);
        projs.sharedProjects.sort(Sorters['Name']);
        console.log(projs.myProjects);
        setProjects(projs);
      } else if (sort === 'Oldest') {
        projs.myProjects.sort(Sorters['Oldest']);
        projs.sharedProjects.sort(Sorters['Oldest']);
        setProjects(projs);
      } else {
        projs.myProjects.sort(Sorters['Newest']);
        projs.sharedProjects.sort(Sorters['Newest']);
        setProjects(projs);
      }
    }
  }, [sort]);

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
      {projects && (
        <ProjectsGrid
          projects={
            filter === ProjectFilter.MINE
              ? projects.myProjects.filter((p) =>
                  search
                    ? p.project.title.includes(search) ||
                      p.project.description.includes(search)
                    : true
                )
              : projects.sharedProjects.filter((p) =>
                  search
                    ? p.project.title.includes(search) ||
                      p.project.description.includes(search)
                    : true
                )
          }
          i18n={props.i18n}
        />
      )}
    </div>
  );
};
