import { Sidebar } from '@components/Sidebar/index.ts';
import { useState } from 'react';

import './SideTabScrollingContainer.css';

interface SideTabScrollingContainerProps {
  children: any;

  sidebarHeaderLabel: string | undefined;

  containerHeight: string;

  tabs: {
    name: string;
    label: string;
  }[];

  selection: string;

  onSelect(selection: string): void;
}

export const SideTabScrollingContainer = (
  props: SideTabScrollingContainerProps
) => {
  return (
    <div className='stsc-container'>
      <section className='stsc-sidebar-wrapper'>
        <Sidebar
          tabs={props.tabs}
          selection={props.selection}
          onSelect={props.onSelect}
          headerLabel={props.sidebarHeaderLabel}
        />
      </section>
      <section
        className='stsc-contents-container'
        style={{ height: props.containerHeight }}
      >
        <div className='stsc-content-wrapper'>{props.children}</div>
      </section>
    </div>
  );
};
