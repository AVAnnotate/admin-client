import { useMemo, useState, useCallback, useEffect } from 'react';
import './EventList.css';
import type {
  ProjectData,
  Translations,
  Event,
  EventWithUUID,
} from '@ty/Types.ts';
import { Button } from '@radix-ui/themes';
import { PlusIcon, DownloadIcon } from '@radix-ui/react-icons';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { EventRow } from './EventRow.tsx';
import { DropdownButton } from '@components/DropdownButton/DropdownButton.tsx';
import { exportEvents } from '@lib/events/export.ts';
import { EmptyDashboard } from '@components/EmptyDashboard/EmptyDashboards.tsx';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SortAlphaDown, SortAlphaUp } from 'react-bootstrap-icons';

interface Sort {
  direction: 'asc' | 'desc';
  column: 'label' | 'updated_at';
}

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;

  onDelete(eventId: string): void;
}

const captilize = (str: string) => {
  return str
    .split(' ')
    .map((sub) => sub.charAt(0).toLocaleUpperCase() + sub.slice(1))
    .join(' ');
};

export const EventList: React.FC<Props> = (props) => {
  const [saving, setSaving] = useState(false);
  const [project] = useState(props.project);
  const [events, setEvents] = useState<EventWithUUID[]>([]);

  useEffect(() => {
    if (props.project.events) {
      const res: EventWithUUID[] = [];
      Object.keys(props.project.events).forEach((uuid) => {
        res.push({ ...props.project.events[uuid], uuid });
      });

      setEvents(res);
    }
  }, [props.project]);

  const [currentSort, setCurrentSort] = useState<Sort>({
    direction: 'asc',
    column: 'label',
  });
  const [searchQuery, setSearchQuery] = useState<null | string>(null);

  const updateSearchQuery = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const value = ev.currentTarget.value;

      if (!value) {
        setSearchQuery(null);
      } else {
        setSearchQuery(value);
      }
    },
    []
  );

  // Apply searching, sorting, and whatever other filtering is needed
  const sortedEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery) {
      result = events.filter((event) =>
        event.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result = result.sort((a: Event, b: Event) => {
      const aValue = a[currentSort.column];
      const bValue = b[currentSort.column];

      if (aValue > bValue) {
        return currentSort.direction === 'asc' ? 1 : -1;
      } else if (aValue < bValue) {
        return currentSort.direction === 'asc' ? -1 : 1;
      }

      return 0;
    });

    return result;
  }, [events, currentSort, searchQuery]);

  const { t } = props.i18n;

  return (
    <>
      {saving && <LoadingOverlay />}
      <div className='event-list'>
        <div className='event-list-top-bar'>
          <div className='event-list-left-title'>
            <h1>{t['Audiovisual Events']}</h1>
          </div>
          <div className='event-list-right-actions'>
            <Dropdown.Root modal={false}>
              <Dropdown.Trigger className='sort-button'>
                {currentSort.direction === 'asc' ? (
                  <SortAlphaUp color='black' />
                ) : (
                  <SortAlphaDown color='black' />
                )}
                <span>
                  {currentSort.column === 'label'
                    ? t['Label']
                    : t['Last Updated']}
                </span>
                <ChevronDownIcon />
              </Dropdown.Trigger>
              <Dropdown.Content className='dropdown-content'>
                <Dropdown.Item
                  className='dropdown-item'
                  onClick={() =>
                    setCurrentSort({
                      column: 'label',
                      direction: 'asc',
                    })
                  }
                >
                  <SortAlphaUp />
                  {`${t['Label']} ${t['Ascending']}`}
                </Dropdown.Item>
                <Dropdown.Item
                  className='dropdown-item'
                  onClick={() =>
                    setCurrentSort({
                      column: 'label',
                      direction: 'desc',
                    })
                  }
                >
                  <SortAlphaDown />
                  {`${t['Label']} ${t['Descending']}`}
                </Dropdown.Item>
                <Dropdown.Item
                  className='dropdown-item'
                  onClick={() =>
                    setCurrentSort({
                      column: 'updated_at',
                      direction: 'asc',
                    })
                  }
                >
                  <SortAlphaUp />
                  {`${t['Last Updated']} ${t['Ascending']}`}
                </Dropdown.Item>
                <Dropdown.Item
                  className='dropdown-item'
                  onClick={() =>
                    setCurrentSort({
                      column: 'updated_at',
                      direction: 'desc',
                    })
                  }
                >
                  <SortAlphaDown />
                  {`${t['Last Updated']} ${t['Descending']}`}
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Root>

            <div className='table-search'>
              <input
                className='table-search-box'
                onChange={updateSearchQuery}
              />
              <MagnifyingGlassIcon className='table-search-icon' />
            </div>
            <Button
              className='csv-button'
              onClick={() =>
                exportEvents(
                  props.project.project.title,
                  Object.keys(props.project.events).map(
                    (k) => props.project.events[k]
                  )
                )
              }
              type='button'
            >
              <DownloadIcon />
              {t['CSV']}
            </Button>
            <DropdownButton
              title={t['Add Event']}
              titleIcon={<PlusIcon />}
              items={[
                {
                  icon: <PlusIcon />,
                  label: t['Add single event'],
                  onClick: () =>
                    (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/new`),
                },
                {
                  icon: <FileEarmarkArrowUp />,
                  label: t['Import multiple from file'],
                  onClick: () =>
                    (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/import`),
                },
              ]}
            />
          </div>
        </div>
        {sortedEvents && sortedEvents.length > 0 ? (
          <div className='event-list-box-container'>
            {sortedEvents.map((event, idx) => (
              <EventRow
                project={project}
                event={event}
                index={idx}
                i18n={props.i18n}
                key={event.uuid}
                onDelete={() => props.onDelete(event.uuid)}
              />
            ))}
          </div>
        ) : (
          <EmptyDashboard description={t['No events have been added']}>
            <Button
              className='button primary empty-action-button'
              onClick={() =>
                (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/import`)
              }
              type='button'
            >
              <FileEarmarkArrowUp />
              {t['Import multiple from file']}
            </Button>
            <Button
              className='button outline empty-action-button'
              type='button'
              onClick={() =>
                (window.location.href = `/${props.i18n.lang}/projects/${props.projectSlug}/events/new`)
              }
            >
              <PlusIcon />
              {t['Add single event']}
            </Button>
          </EmptyDashboard>
        )}
      </div>
    </>
  );
};
