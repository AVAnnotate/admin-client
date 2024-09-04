import type {
  AnnotationEntry,
  Event,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import './EventDetail.css';
import {
  DownloadIcon,
  MagnifyingGlassIcon,
  Pencil2Icon,
  PlusIcon,
  SpeakerLoudIcon,
  VideoIcon,
} from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { Player } from './Player.tsx';
import { FileEarmarkArrowUp, Trash } from 'react-bootstrap-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { serialize } from '@lib/slate/index.tsx';
import { Node } from 'slate';
import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { DeleteEventModal } from '@components/DeleteEventModal/DeleteEventModal.tsx';
import { AnnotationModal } from '@components/AnnotationModal/index.ts';
import { DeleteModal } from '@components/DeleteModal/DeleteModal.tsx';
import { SetSelect } from './SetSelect.tsx';
import { AvFilePicker } from './AvFilePicker.tsx';
import { AnnotationTable } from './AnnotationTable.tsx';
import { exportAnnotations } from '@lib/events/export.ts';
import { SetFormModal } from '@components/SetModal/SetModal.tsx';
import type { apiAnnotationSetPost } from '@ty/api.ts';

interface EventDetailProps {
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

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

// sort by start time and then by end time
const sortAnnotations = (annos: AnnotationEntry[]) =>
  annos.sort((a, b) => {
    if (a.start_time > b.start_time) {
      return 1;
    } else if (a.start_time < b.start_time) {
      return -1;
    } else {
      if (a.end_time > b.end_time) {
        return 1;
      } else if (a.end_time < b.end_time) {
        return -1;
      } else {
        return 0;
      }
    }
  });

const onSubmitAdd = async (newAnno: AnnotationEntry, baseUrl: string) => {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_time: newAnno.start_time,
      end_time: newAnno.end_time,
      annotation: newAnno.annotation,
      tags: newAnno.tags,
    }),
  });

  if (res.ok) {
    return (await res.json()) as AnnotationEntry[];
  }
};

const onSubmitCreateSet = async (
  newSet: apiAnnotationSetPost,
  baseUrl: string
) => {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_id: newSet.event_id,
      set: newSet.set,
      source_id: newSet.source_id,
    }),
  });

  if (res.ok) {
    window.location.reload();
  }
};

const onSubmitEdit = async (editAnno: AnnotationEntry, baseUrl: string) => {
  const res = await fetch(`${baseUrl}/${editAnno.uuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_time: editAnno.start_time,
      end_time: editAnno.end_time,
      annotation: editAnno.annotation,
      tags: editAnno.tags,
    }),
  });

  if (res.ok) {
    return (await res.json()) as AnnotationEntry;
  }
};

export const EventDetail: React.FC<EventDetailProps> = (props) => {
  const { lang, t } = props.i18n;

  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  // AV files are required in the Add Event form so we can
  // safely assume that one exists
  const [avFile, setAvFile] = useState(
    Object.keys(props.event.audiovisual_files)[0]
  );

  // UUID of the annotation currently selected for deletion
  const [deleteAnnoUuid, setDeleteAnnoUuid] = useState('');

  // UUID of the annotation currently selected for editing
  const [editAnnoUuid, setEditAnnoUuid] = useState('');

  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [showEventDeleteModal, setShowEventDeleteModal] = useState(false);
  const [showAnnoCreateModal, setShowAnnoCreateModal] = useState(false);
  const [search, setSearch] = useState('');

  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // all annotation sets from this project
  const [allAnnotations, setAllAnnotations] = useState(
    Object.fromEntries(
      Object.entries(props.project.annotations).filter((ent) => {
        const anno = props.project.annotations[ent[0]];

        return anno.event_id === props.eventUuid;
      })
    )
  );

  // get all annotation sets that belong to this AV file
  const sets = useMemo(
    () =>
      Object.keys(props.project.annotations)
        .filter((uuid) => {
          const match = props.project.annotations[uuid];

          return (
            match.event_id === props.eventUuid && match.source_id === avFile
          );
        })
        .map((uuid) => ({
          uuid,
          label: props.project.annotations[uuid].set,
        })),
    [props.project, props.eventUuid, avFile]
  );

  // the set that's currently selected for viewing
  const [currentSetUuid, setCurrentSetUuid] = useState<string | null>(
    sets.length > 0 ? sets[0].uuid : null
  );

  // default to the current set whenever the list of sets changes,
  // e.g. when changing AV files
  useEffect(() => {
    setCurrentSetUuid(sets.length > 0 ? sets[0].uuid : null);
  }, [sets]);

  // the annotations to display (can be limited via search)
  const displayAnnotations = useMemo(() => {
    if (currentSetUuid) {
      if (search) {
        return sortAnnotations(
          searchAnnotations(allAnnotations[currentSetUuid].annotations, search)
        );
      } else {
        return sortAnnotations(allAnnotations[currentSetUuid].annotations);
      }
    }

    return [];
  }, [search, allAnnotations, currentSetUuid]);

  const baseUrl = useMemo(
    () =>
      `/api/projects/${props.projectSlug}/events/${props.eventUuid}/annotations`,
    [props.projectSlug, props.eventUuid, currentSetUuid]
  );

  const setUrl = useMemo(
    () => `${baseUrl}/${currentSetUuid}`,
    [baseUrl, currentSetUuid]
  );

  const onCreate = async (body: AnnotationEntry) => {
    const newAnno = await onSubmitAdd(body, setUrl);

    if (newAnno && newAnno.length > 0) {
      setAllAnnotations((oldAnnos) => {
        if (currentSetUuid) {
          const updatedEntry = { ...oldAnnos[currentSetUuid] };
          updatedEntry.annotations.push(newAnno[0]);
          return { ...oldAnnos, [currentSetUuid]: updatedEntry };
        } else {
          return {};
        }
      });
    }

    setShowAnnoCreateModal(false);
  };

  const onDelete = async () => {
    const res = await fetch(`${setUrl}/${deleteAnnoUuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      setAllAnnotations((oldAnnos) => {
        if (currentSetUuid) {
          const updatedEntry = oldAnnos[currentSetUuid];
          updatedEntry.annotations = updatedEntry.annotations.filter(
            (anno) => anno.uuid !== deleteAnnoUuid
          );

          return { ...oldAnnos, [currentSetUuid]: updatedEntry };
        } else {
          return {};
        }
      });
    }

    setDeleteAnnoUuid('');
  };

  const onEdit = async (body: AnnotationEntry) => {
    const newAnno = await onSubmitEdit(body, setUrl);

    if (newAnno) {
      setAllAnnotations((oldAnnos) => {
        if (currentSetUuid) {
          const updatedSet = oldAnnos[currentSetUuid];
          updatedSet.annotations = updatedSet.annotations.map((anno) =>
            anno.uuid === newAnno.uuid ? newAnno : anno
          );

          return { ...oldAnnos, [currentSetUuid]: updatedSet };
        } else {
          return {};
        }
      });
    }

    setEditAnnoUuid('');
  };

  const onCreateSet = async (name: string) => {
    const newSet = {
      event_id: props.eventUuid,
      set: name,
      source_id: avFile,
    };

    await onSubmitCreateSet(newSet, baseUrl);
  };

  return (
    <>
      {deleteAnnoUuid && (
        <DeleteModal
          name={t['Annotation']}
          i18n={props.i18n}
          onDelete={onDelete}
          onCancel={() => setDeleteAnnoUuid('')}
        />
      )}
      {editAnnoUuid && (
        <AnnotationModal
          annotation={displayAnnotations.find(
            (ann) => ann.uuid === editAnnoUuid
          )}
          onClose={() => setEditAnnoUuid('')}
          onSubmit={onEdit}
          i18n={props.i18n}
          title={t['Edit Annotation']}
          project={props.project}
        />
      )}
      {showAddSetModal && (
        <SetFormModal
          i18n={props.i18n}
          title={t['Create Annotation Set']}
          onClose={() => setShowAddSetModal(false)}
          onSave={onCreateSet}
        />
      )}
      {showAnnoCreateModal && (
        <AnnotationModal
          onClose={() => setShowAnnoCreateModal(false)}
          onSubmit={onCreate}
          i18n={props.i18n}
          title={t['Add Annotation']}
          project={props.project}
        />
      )}
      {showEventDeleteModal && (
        <DeleteEventModal
          annotations={props.project.annotations}
          eventUuid={props.eventUuid}
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
                href={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/edit`}
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
              <AvFilePicker
                event={props.event}
                onChange={(uuid) => setAvFile(uuid)}
                value={avFile}
              />
            </div>
          )}
          <Player
            type={props.event.item_type}
            i18n={props.i18n}
            url={props.event.audiovisual_files[avFile].file_url}
            position={annoPosition}
          />
          <div className='set-info-bar'>
            <h3>{t['Annotations']}</h3>
            <div className='set-info-bar-right'>
              {sets.length > 1 && (
                <SetSelect
                  onChange={(uuid) => setCurrentSetUuid(uuid)}
                  sets={sets}
                  value={
                    sets.find((set) => set.uuid === currentSetUuid) || sets[0]
                  }
                />
              )}
              <Button
                className='primary add-set-button'
                onClick={() => setShowAddSetModal(true)}
              >
                {t['Add Set']}
                <PlusIcon />
              </Button>
            </div>
          </div>
          <div className='event-detail-table-header'>
            <p>
              {sets.length > 1
                ? sets.find((set) => set.uuid === currentSetUuid)?.label
                : t['All Annotations']}
              ({displayAnnotations.length})
            </p>
            <div className='header-buttons'>
              <div className='formic-form-field'>
                <input
                  className='searchbox formic-form-text'
                  onChange={(ev) => {
                    if (searchDebounceTimer.current) {
                      clearTimeout(searchDebounceTimer.current);
                    }

                    searchDebounceTimer.current = setTimeout(
                      () => setSearch(ev.target.value),
                      200
                    );
                  }}
                  type='text'
                />
                <MagnifyingGlassIcon />
              </div>
              {currentSetUuid && (
                <Button
                  className='csv-button'
                  onClick={() =>
                    exportAnnotations(
                      allAnnotations[currentSetUuid].annotations,
                      props.event,
                      avFile
                    )
                  }
                  type='button'
                >
                  <DownloadIcon />
                  {t['CSV']}
                </Button>
              )}
              <Button
                className='primary'
                onClick={() =>
                  (window.location.pathname = `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/import`)
                }
              >
                <FileEarmarkArrowUp />
                {t['import']}
              </Button>
              <Button
                className='primary'
                onClick={() => setShowAnnoCreateModal(true)}
              >
                <PlusIcon />
                {t['Add']}
              </Button>
            </div>
          </div>
        </div>
        <AnnotationTable
          i18n={props.i18n}
          displayAnnotations={displayAnnotations}
          project={props.project}
          setDeleteAnnoUuid={setDeleteAnnoUuid}
          setEditAnnoUuid={setEditAnnoUuid}
          setAnnoPosition={setAnnoPosition}
        />
      </div>
    </>
  );
};
