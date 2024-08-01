import type { Event, ProjectData, Translations } from '@ty/Types.ts';
import './EventDetail.css';
import {
  DownloadIcon,
  MagnifyingGlassIcon,
  Pencil2Icon,
  PlusIcon,
  SpeakerLoudIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import { Button, Table } from '@radix-ui/themes';
import { Player } from './Player.tsx';
import { FileEarmarkArrowUp, Trash } from 'react-bootstrap-icons';
import { useMemo, useState } from 'react';
import { formatTimestamp } from '@lib/events/index.ts';
import { serialize } from '@lib/slate/index.tsx';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { Node } from 'slate';

const formatTimestamps = (start: number, end: number) =>
  `${formatTimestamp(start, false)} - ${formatTimestamp(end, false)}`;

interface EventDetailProps {
  event: Event;
  uuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

export const EventDetail: React.FC<EventDetailProps> = (props) => {
  const [search, setSearch] = useState('');

  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  const { lang, t } = props.i18n;

  const annotations = useMemo(() => {
    const match = Object.keys(props.project.annotations).find(
      (uuid) => props.project.annotations[uuid].event_id === props.uuid
    );

    if (match) {
      const annos = props.project.annotations[match].annotations;

      annos.sort((a, b) => {
        if (a.start_time > b.start_time) {
          return 1;
        } else if (a.start_time < b.start_time) {
          return -1;
        } else {
          return 0;
        }
      });

      if (search) {
        return annos.filter((anno) => {
          // since annos are rich text, we have to grab the plain text
          // from them in order to search
          const plainTextAnno = anno.annotation
            .map((n) => Node.string(n))
            .join('\n')
            .toLowerCase();
          return plainTextAnno.includes(search.toLowerCase());
        });
      } else {
        return annos;
      }
    } else {
      return [];
    }
  }, [props.project, search]);

  const tagGroups = useMemo(() => {
    const obj: { [key: string]: string } = {};

    props.project.project.tags.tagGroups.forEach(
      (tg) => (obj[tg.category.toLowerCase()] = tg.color)
    );

    return obj;
  }, [props.project]);

  return (
    <>
      {/* todo: edit/delete modals */}
      <div className='event-detail container'>
        <div className='event-detail-floating-header'>
          <div className='event-detail-top-bar'>
            <div className='event-detail-label'>
              {props.event.item_type === 'Audio' && <SpeakerLoudIcon />}
              {props.event.item_type === 'Video' && <VideoIcon />}
              <h2>{props.event.label}</h2>
            </div>
            <div className='event-detail-options'>
              <a
                href={`/${lang}/projects/${props.projectSlug}/events/${props.uuid}/edit`}
              >
                <Button
                  className='event-detail-button edit-button'
                  type='button'
                >
                  <Pencil2Icon />
                  {t['Edit']}
                </Button>
              </a>
              <Button
                className='event-detail-button delete-button'
                type='button'
              >
                <Trash />
                {t['Delete']}
              </Button>
            </div>
          </div>
          {props.event.citation && (
            <p>{`${t['Provider']}: ${props.event.citation}`}</p>
          )}
          <div>{serialize(props.event.description)}</div>
          <Player
            i18n={props.i18n}
            url={Object.entries(props.event.audiovisual_files)[0][1].file_url}
            position={annoPosition}
          />
          <div className='event-detail-table-header'>
            <h3>{t['Annotations']}</h3>
            <div className='header-buttons'>
              <div className='formic-form-field'>
                <input
                  className='searchbox formic-form-text'
                  onChange={(ev) => setSearch(ev.target.value)}
                  type='text'
                />
                <MagnifyingGlassIcon />
              </div>
              <Button className='csv-button' type='button'>
                <DownloadIcon />
                {t['CSV']}
              </Button>
              <Button className='primary'>
                <FileEarmarkArrowUp />
                {t['import']}
              </Button>
              <Button className='primary'>
                <PlusIcon />
                {t['Add']}
              </Button>
            </div>
          </div>
        </div>
        <div className='event-detail-table-container'>
          <Table.Root>
            <Table.Header>
              <Table.Row className='header-row'>
                <Table.ColumnHeaderCell className='timestamp-column'>
                  <div className='header-cell-container'>{t['Timestamp']}</div>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className='text-column'>
                  <div className='header-cell-container'>{t['Text']}</div>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className='tags-header-cell tags-column'>
                  <div className='header-cell-container'>{t['Tags']}</div>
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className='options-header-cell options-column'></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {annotations.map((an) => (
                <Table.Row className='annotation-table-row' key={an.uuid}>
                  <Table.Cell
                    className='annotation-data-cell timestamp-cell'
                    onClick={() => setAnnoPosition(an.start_time)}
                  >
                    <p>{formatTimestamps(an.start_time, an.end_time)}</p>
                  </Table.Cell>
                  <Table.Cell
                    className='annotation-data-cell annotation-cell'
                    onClick={() => setAnnoPosition(an.start_time)}
                  >
                    {serialize(an.annotation)}
                  </Table.Cell>
                  <Table.Cell
                    className='annotation-data-cell tag-cell'
                    onClick={() => setAnnoPosition(an.start_time)}
                  >
                    <div className='tag-cell-container'>
                      {an.tags.map((t, idx) => (
                        <div
                          className='tag-item'
                          key={idx}
                          style={{
                            backgroundColor:
                              tagGroups[
                                t.category.toLowerCase() as keyof typeof tagGroups
                              ],
                          }}
                        >
                          <span className='tag-content'>{t.tag}</span>
                        </div>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell className='meatball-cell'>
                    <div className='meatball-container'>
                      <MeatballMenu
                        buttons={[
                          {
                            label: t['Edit'],
                            icon: Pencil2Icon,
                            onClick: () => {},
                          },
                          {
                            label: t['Delete'],
                            icon: Trash,
                            onClick: () => {},
                          },
                        ]}
                        row={t}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      </div>
    </>
  );
};
