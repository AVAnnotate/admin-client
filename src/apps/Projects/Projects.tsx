import type { Translations, UserInfo } from '@ty/Types.ts';
import { Plus } from '@phosphor-icons/react/Plus';
import { Header } from './Header/Header.tsx';
import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ProjectFilter } from './Header/Header.tsx';
import { ProjectsGrid } from './ProjectsGrid/ProjectsGrid.tsx';
import { Sorters } from '@components/SortAction/index.ts';
import type { ProjectData } from '@ty/Types.ts';

import './Projects.css';

export type Repositories = {
  org: string;
  repo: string;
  title: string;
  created_at: string;
  updated_at: string;
};
export interface ProjectsProps {
  repos: Repositories[];

  i18n: Translations;

  userInfo: UserInfo;
}

export const Projects = (props: ProjectsProps) => {
  const { t, lang } = props.i18n;

  const [filter, setFilter] = useState(ProjectFilter.MINE);
  const [search, setSearch] = useState<string | undefined>();
  const [sort, setSort] = useState<'Name' | 'Oldest' | 'Newest'>('Newest');
  const [projects, setProjects] = useState<ProjectData[] | undefined>();
  const [readyCount, setReasyCount] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleChangeFilter = (filter: ProjectFilter) => {
    setFilter(filter);
  };

  const handleChangeSearch = (value: string) => {
    setSearch(value);
  };

  const handleChangeSort = (sortFn: 'Name' | 'Oldest' | 'Newest') => {
    setSort(sortFn);
  };

  const getProjectData = (org: string, repo: string): Promise<any> => {
    return fetch(`/api/git-repos/${org}/${repo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((resp) => {
      if (resp.ok) {
        return resp.json().then((data) => {
          return data;
        });
      } else {
        return null;
      }
    });
  };

  useEffect(() => {
    if (props.repos) {
      const all: ProjectData[] = [];

      setSaving(true);

      props.repos.forEach((repo) => {
        all.push({
          // @ts-ignore
          project: {
            slug: repo.repo,
            title: repo.title,
            github_org: repo.org,
          },
          repo_created_at: repo.created_at,
          repo_updated_at: repo.updated_at,
        });
      });

      setProjects(all.sort(Sorters[sort]));
    }
  }, [props.repos]);

  useEffect(() => {
    if (projects) {
      const projs: ProjectData[] = JSON.parse(JSON.stringify(projects));
      if (sort === 'Name') {
        projs.sort(Sorters['Name']);
        setProjects(projs);
      } else if (sort === 'Oldest') {
        projs.sort(Sorters['Oldest']);
        setProjects(projs);
      } else {
        projs.sort(Sorters['Newest']);
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
          projects={projects}
          search={search || ''}
          i18n={props.i18n}
          filter={filter}
          userInfo={props.userInfo}
          getProjectData={getProjectData}
        />
      )}
    </div>
  );
};
