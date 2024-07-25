import './Sidebar.css';
import React from 'react';

interface SidebarProps {
  selection: string;

  onSelect(select: string): void;

  tabs: {
    name: string;
    label: string;
  }[];
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <div className='sidebar-container'>
      {props.tabs.map((tab) => (
        <React.Fragment key={tab.name}>
          <div
            className={
              props.selection === tab.name
                ? 'sidebar-selection sidebar-active'
                : 'sidebar-selection'
            }
            onClick={() => props.onSelect(tab.name)}
          >
            <h3>{tab.label}</h3>
          </div>
          <div className='sidebar-separator' />
        </React.Fragment>
      ))}
    </div>
  );
};
