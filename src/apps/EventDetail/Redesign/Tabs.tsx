import './Tabs.css';

interface Tab {
  title: string;
  uuid: string;
}

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  tabs: Tab[];
}

const Tabs: React.FC<Props> = (props) => {
  return (
    <div className='event-detail-tabs-container'>
      {props.tabs.map((tab) => (
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
          {tab.title}
        </button>
      ))}
      {props.children}
    </div>
  );
};

export default Tabs;
