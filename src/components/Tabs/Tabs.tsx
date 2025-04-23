import * as RadixTabs from '@radix-ui/react-tabs';
import { useEffect, useState } from 'react';
import './Tabs.css';
import React from 'react';

interface Props {
  tabs: {
    title: string;
    count?: number;
    component: React.JSX.Element;
    icon?: React.FC<any>;
    // if this is true, the tab is always mounted.
    // otherwise, it will unmount when the user changes tabs
    keepMounted?: boolean;
  }[];
  activeTab?: string;
  onSetActive?(tab: string): void;
}

export const Tabs: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState(props.activeTab || 'tab0');

  const handleSetActive = (tab: string) => {
    if (props.onSetActive) {
      props.onSetActive(tab);
    }

    setActiveTab(tab);
  };

  useEffect(() => {
    if (props.activeTab && props.activeTab !== activeTab) {
      setActiveTab(props.activeTab);
    }
  }, [props.activeTab]);

  return (
    <RadixTabs.Root className='tabs' value={activeTab}>
      <RadixTabs.List className='tab-list'>
        {props.tabs.map((tab, idx) => (
          <RadixTabs.Trigger
            className='tab-trigger'
            key={idx}
            onClick={() => handleSetActive(`tab${idx}`)}
            value={`tab${idx}`}
          >
            {tab.icon && (
              <div className='tab-icon'>
                <tab.icon />
              </div>
            )}
            {tab.title}
            {Number.isInteger(tab.count) && (
              <div className='tab-count'>{tab.count}</div>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {props.tabs.map((tab, idx) => (
        <RadixTabs.Content
          key={idx}
          value={`tab${idx}`}
          forceMount={tab.keepMounted || undefined}
          hidden={
            tab.keepMounted && `tab${idx}` !== activeTab ? true : undefined
          }
          className='tab-content'
        >
          {tab.component}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
