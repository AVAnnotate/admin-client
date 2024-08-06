import type {
  AnnotationEntry,
  AnnotationPage,
  Event,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import './EventDetail.css';
import {
  ChevronDownIcon,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatTimestamp } from '@lib/events/index.ts';
import { serialize } from '@lib/slate/index.tsx';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { Node } from 'slate';
import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { DeleteEventModal } from '@components/DeleteEventModal/DeleteEventModal.tsx';
import * as Select from '@radix-ui/react-select';
import { AnnotationModal } from '@components/AnnotationModal/index.ts';
import { DeleteModal } from '@components/DeleteModal/DeleteModal.tsx';

const formatTimestamps = (start: number, end: number) =>
  `${formatTimestamp(start, false)} - ${formatTimestamp(end, false)}`;

interface EventDetailProps {
  event: Event;
  uuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

const getAnnotations = (project: ProjectData, annoFile: string | undefined) => {
  if (annoFile) {
    const annos = project.annotations[annoFile].annotations;

    return sortAnnotations(annos);
  } else {
    return [];
  }
};

const searchAnnotations = (annos: AnnotationEntry[], search: string) =>
  annos.filter((anno) => {
    // since annos are rich text, we have to grab the plain text
    // from them in order to search
    const plainTextAnno = anno.annotation
      .map((n) => Node.string(n))
      .join('\n')
      .toLowerCase();

    return plainTextAnno.includes(search.toLowerCase());
  });

const sortAnnotations = (annos: AnnotationEntry[]) =>
  annos.sort((a, b) => {
    if (a.start_time > b.start_time) {
      return 1;
    } else if (a.start_time < b.start_time) {
      return -1;
    } else {
      return 0;
    }
  });

export const EventDetail: React.FC<EventDetailProps> = (props) => {
  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  // AV files are required in the Add Event form so we can safely
  // assume that one exists
  const [avFile, setAvFile] = useState(
    Object.keys(props.event.audiovisual_files)[0]
  );

  const [deleteUuid, setDeleteUuid] = useState<null | string>(null);
  const [editUuid, setEditUuid] = useState<null | string>(null);
  const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);

  const annoFile = useMemo(
    () =>
      Object.keys(props.project.annotations).find((uuid) => {
        const match = props.project.annotations[uuid];

        return match.event_id === props.uuid && match.source_id === avFile;
      }),
    [props.project, props.uuid, avFile]
  );

  const [allAnnotations, setAllAnnotations] = useState(
    getAnnotations(props.project, annoFile)
  );

  const [filteredAnnotations, setFilteredAnnotations] =
    useState(allAnnotations);

  const onSearch = useCallback(
    (search: string) => {
      setFilteredAnnotations(searchAnnotations(allAnnotations, search));
    },
    [allAnnotations]
  );

  // reset the annotation list when the user switches AV files
  useEffect(() => {
    const newAnnos = getAnnotations(props.project, annoFile);
    setAllAnnotations(newAnnos);
  }, [avFile, props.project, annoFile]);

  // reset the filter state when the full anno list changes
  useEffect(() => {
    setFilteredAnnotations(allAnnotations);
  }, [allAnnotations]);

  const { lang, t } = props.i18n;

  const tagGroups = useMemo(() => {
    const obj: { [key: string]: string } = {};

    props.project.project.tags.tagGroups.forEach(
      (tg) => (obj[tg.category.toLowerCase()] = tg.color)
    );

    return obj;
  }, [props.project]);

  return (
    <>
      {deleteUuid && (
        <DeleteModal
          name={t['Annotation']}
          i18n={props.i18n}
          onDelete={async () => {
            const res = await fetch(
              `/api/projects/${props.projectSlug}/events/${props.uuid}/annotations/${annoFile}/${deleteUuid}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (res.ok) {
              // remove the annotation from view without reloading
              const body: AnnotationPage = await res.json();

              setAllAnnotations(sortAnnotations(body.annotations));

              setDeleteUuid(null);
            }
          }}
          onCancel={() => setDeleteUuid(null)}
        />
      )}
      {editUuid && (
        <AnnotationModal
          annotation={filteredAnnotations.find((ann) => ann.uuid === editUuid)}
          onClose={() => setEditUuid(null)}
          onSubmit={(ann) => console.log(ann)}
          i18n={props.i18n}
          title={t['Edit Annotation']}
          project={props.project}
        />
      )}
      {showEventDeleteModal && (
        <DeleteEventModal
          annotations={props.project.annotations}
          eventUuid={props.uuid}
          i18n={props.i18n}
          onAfterSave={() =>
            (window.location.pathname = `/${lang}/projects/${props.projectSlug}`)
          }
          onCancel={() => setShowEventDeleteModal(false)}
          projectSlug={props.projectSlug}
        />
      )}
      <div className='breadcrumbs-container'>
        <Breadcrumbs
          items={[
            { label: t['Projects'], link: `/${lang}/projects` },
            {
              label: props.project.project.title,
              link: `/${lang}/projects/${props.projectSlug}`,
            },
            {
              label: props.event.label,
            },
          ]}
        />
      </div>
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
                onClick={() => setShowEventDeleteModal(true)}
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
          {Object.keys(props.event.audiovisual_files).length > 1 && (
            <div className='av-file-selection'>
              <span className='av-file-label'>{t['AV File']}</span>
              <Select.Root
                onValueChange={(uuid) => setAvFile(uuid)}
                value={avFile}
              >
                <Select.Trigger className='select-trigger'>
                  <Select.Value className='select-value' />
                  <Select.Icon className='select-icon'>
                    <ChevronDownIcon />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className='select-content' position='popper'>
                    <Select.Viewport className='select-viewport'>
                      {Object.keys(props.event.audiovisual_files).map(
                        (uuid, idx) => (
                          <Select.Item
                            className='select-item'
                            key={uuid}
                            value={uuid}
                          >
                            <Select.ItemText className='select-item-text'>
                              {idx + 1}.&nbsp;
                              {props.event.audiovisual_files[uuid].label}&nbsp;
                              (
                              {formatTimestamp(
                                props.event.audiovisual_files[uuid].duration,
                                false
                              )}
                              )
                            </Select.ItemText>
                            <Select.ItemIndicator className='select-indicator'></Select.ItemIndicator>
                          </Select.Item>
                        )
                      )}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          )}
          <Player
            i18n={props.i18n}
            url={props.event.audiovisual_files[avFile].file_url}
            position={annoPosition}
          />
          <div className='event-detail-table-header'>
            <h3>{t['Annotations']}</h3>
            <div className='header-buttons'>
              <div className='formic-form-field'>
                <input
                  className='searchbox formic-form-text'
                  onChange={(ev) => onSearch(ev.target.value)}
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
              {filteredAnnotations.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={4} className='empty-annos-note'>
                    <p>{t['No annotations have been added.']}</p>
                  </Table.Cell>
                </Table.Row>
              )}
              {filteredAnnotations.map((an) => (
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
                            onClick: () => setEditUuid(an.uuid),
                          },
                          {
                            label: t['Delete'],
                            icon: Trash,
                            onClick: () => setDeleteUuid(an.uuid),
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
