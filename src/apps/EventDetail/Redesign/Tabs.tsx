import { Fragment, type ReactNode } from 'react';
import './Tabs.css';

interface Tab {
  title: string;
  uuid: string;
}

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  currentTab: Tab;
  renderIcon?: (tab: Tab) => ReactNode;
  setTab: (tab: Tab) => void;
  showDividers?: boolean;
  tabs: Tab[];
}

const Tabs: React.FC<Props> = (props) => {
  return (
    <div className='event-detail-tabs-container'>
      {props.tabs.map((tab) => (
        <Fragment key={tab.uuid}>
          <button
            className={`event-detail-tab-button ${
              tab.uuid === props.currentTab.uuid
                ? 'event-detail-selected-tab'
                : ''
            }`}
            key={tab.uuid}
            onClick={() => props.setTab(tab)}
            type='button'
          >
            {props.renderIcon && props.renderIcon(tab)}
            {tab.title}
          </button>
          {props.showDividers && <div className='vertical-divider' />}
        </Fragment>
      ))}
      {props.children}
    </div>
  );
};

export default Tabs;
