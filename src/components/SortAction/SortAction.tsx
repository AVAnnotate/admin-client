import { CaretDown } from '@phosphor-icons/react/CaretDown';
import { SortAscending } from '@phosphor-icons/react/SortAscending';
import { SortDescending } from '@phosphor-icons/react/SortDescending';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import type { Translations, ProjectData } from '@ty/Types.ts';

import './SortAction.css';

interface SortActionProps {
  i18n: Translations;

  onChangeSort(sortFn: string): void;
}

export const Sorters = {
  Name: (a: ProjectData, b: ProjectData) => {
    if (a.project.title > b.project.title) {
      return 1;
    } else if (a.project.title < b.project.title) {
      return -1;
    }

    return 0;
  },

  Newest: (a: ProjectData, b: ProjectData) =>
    a.project.created_at < b.project.created_at ? 1 : -1,

  Oldest: (a: ProjectData, b: ProjectData) =>
    a.project.created_at > b.project.created_at ? 1 : -1,
};

const Icons = {
  Name: <SortAscending />,
  Newest: <SortDescending />,
  Oldest: <SortAscending />,
};

export const SortAction = (props: SortActionProps) => {
  const { t } = props.i18n;

  const [sort, setSort] = useState<keyof typeof Sorters>('Newest');

  const changeSort = (key: keyof typeof Sorters) => () => {
    setSort(key);
    props.onChangeSort(key);
  };

  const item = (key: keyof typeof Sorters) => (
    <Dropdown.Item className='dropdown-item' onSelect={changeSort(key)}>
      {Icons[key]} {t[key]}
    </Dropdown.Item>
  );

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className='sort-button'>
          <div className='sort-button-div'>
            {Icons[sort]} {t[sort]} <CaretDown />
          </div>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content align='end' className='dropdown-content'>
          {item('Name')}
          {item('Newest')}
          {item('Oldest')}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
