import './Tabs.css';

interface Tab {
  title: string;
  uuid: string;
}

interface Props {
  tabs: Tab[];
  currentTab: Tab;
  setTab: (tab: Tab) => void;
}

const EventDetailTabs: React.FC<Props> = (props) => {
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
    </div>
  );
};

export default EventDetailTabs;
