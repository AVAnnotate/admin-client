import type { Translations } from '@ty/Types.ts';
import { useEffect, useState } from 'react';

import './Sidebar.css';

export type SidebarSelection = 'general' | 'users' | 'tags';
interface SidebarProps {
  selection: SidebarSelection;

  i18n: Translations;

  onSelect(select: SidebarSelection): void;
}

export const Sidebar = (props: SidebarProps) => {
  const { t } = props.i18n;

  return (
    <div className='sidebar-container'>
      <div
        className={
          props.selection === 'general'
            ? 'sidebar-selection sidebar-active'
            : 'sidebar-selection'
        }
        onClick={() => props.onSelect('general')}
      >
        <h3>{t['General']}</h3>
      </div>
      <div className='sidebar-separator' />
      <div
        className={
          props.selection === 'users'
            ? 'sidebar-selection sidebar-active'
            : 'sidebar-selection'
        }
        onClick={() => props.onSelect('users')}
      >
        <h3>{t['Users']}</h3>
      </div>
      <div className='sidebar-separator' />
      <div
        className={
          props.selection === 'tags'
            ? 'sidebar-selection sidebar-active'
            : 'sidebar-selection'
        }
        onClick={() => props.onSelect('tags')}
      >
        <h3>{t['Tags']}</h3>
      </div>
    </div>
  );
};
