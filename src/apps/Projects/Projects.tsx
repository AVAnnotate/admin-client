import type { AllProjects, Translations, UserInfo } from '@ty/Types.ts';
import { Plus } from '@phosphor-icons/react/Plus';
import { Header } from './Header/Header.tsx';
import './Projects.css';
import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { ProjectFilter } from './Header/Header.tsx';
import { ProjectsGrid } from './ProjectsGrid/ProjectsGrid.tsx';
import { Sorters } from '@components/SortAction/index.ts';

export type Repositories = { org: string; repo: string; title: string };
export interface ProjectsProps {
  repos: Repositories[];

  i18n: Translations;

  userInfo: UserInfo;
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
      const all: AllProjects = {
        myProjects: [],
        sharedProjects: [],
      };

      props.repos.forEach((repo) => {
        if (repo.org === props.userInfo.profile.gitHubName) {
          all.myProjects.push({
            // @ts-ignore
            project: {
              slug: repo.repo,
              title: repo.title,
              github_org: repo.org,
            },
          });
        } else {
          all.sharedProjects.push({
            // @ts-ignore
            project: {
              slug: repo.repo,
              title: repo.title,
              github_org: repo.org,
            },
          });
        }
      });

      setProjects(all);
    }
  }, [props.repos]);

  useEffect(() => {
    if (projects) {
      const projs: AllProjects = JSON.parse(JSON.stringify(projects));
      if (sort === 'Name') {
        projs.myProjects.sort(Sorters['Name']);
        projs.sharedProjects.sort(Sorters['Name']);
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
          getProjectData={getProjectData}
        />
      )}
    </div>
  );
};
