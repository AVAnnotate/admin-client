import * as RadixTabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import './Tabs.css';
import React from 'react';

interface Props {
  tabs: {
    title: string;
    component: React.JSX.Element;
  }[];
}

export const Tabs: React.FC<Props> = (props) => {
  const [activeTab, setActiveTab] = useState('tab0');

  return (
    <RadixTabs.Root className='tabs' value={activeTab}>
      <RadixTabs.List className='tab-list'>
        {props.tabs.map((tab, idx) => (
          <RadixTabs.Trigger
            className='tab-trigger'
            onClick={() => setActiveTab(`tab${idx}`)}
            value={`tab${idx}`}
          >
            {tab.title}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {props.tabs.map((tab, idx) => (
        <RadixTabs.Content value={`tab${idx}`}>
          {tab.component}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};
