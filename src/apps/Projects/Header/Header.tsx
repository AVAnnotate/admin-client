import { useState } from 'react';

import type { Translations } from '@ty/Types.ts';
import { SearchAction } from '@components/SearchAction/index.ts';
import { SortAction } from '@components/SortAction/index.ts';

import './Header.css';

export enum ProjectFilter {
  MINE,
  SHARED,
}

interface HeaderProps {
  i18n: Translations;
  filter: ProjectFilter;

  onChangeFilter(filter: ProjectFilter): void;
  onChangeSort(sortFn: string): void;
  onChangeSearch(value: string): void;
}

export const Header = (props: HeaderProps) => {
  const { t } = props.i18n;

  return (
    <div className='projects-header'>
      <section className='projects-header-bottom'>
        <ul className='projects-header-tabs'>
          <li
            className={
              props.filter === ProjectFilter.MINE ? 'active' : undefined
            }
            onClick={() => props.onChangeFilter(ProjectFilter.MINE)}
          >
            <button>{t['My Projects']}</button>
          </li>

          <li
            className={
              props.filter === ProjectFilter.SHARED ? 'active' : undefined
            }
            onClick={() => props.onChangeFilter(ProjectFilter.SHARED)}
          >
            <button>{t['Shared Projects']}</button>
          </li>
        </ul>
      </section>
      <div className='project-header-actions'>
        <SearchAction i18n={props.i18n} onChangeSearch={props.onChangeSearch} />

        <SortAction i18n={props.i18n} onChangeSort={props.onChangeSort} />
      </div>
    </div>
  );
};
