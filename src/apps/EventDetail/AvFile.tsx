import type {
  AnnotationEntry,
  AudiovisualFile,
  Event,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import Player from './Player.tsx';
import * as Separator from '@radix-ui/react-separator';
import { useMemo, useState } from 'react';
import Tabs from './Tabs.tsx';
import { AnnotationTableHeader } from './AnnotationTableHeader.tsx';
import { exportAnnotations } from '@lib/events/export.ts';
import type { apiAnnotationSetPost } from '@ty/api.ts';
import { Node } from 'slate';
import { AnnotationModal } from '@components/AnnotationModal/index.ts';
import { SetFormModal } from '@components/SetModal/index.ts';
import { DeleteModal } from '@components/DeleteModal/index.ts';
import AnnotationTable from './AnnotationTable.tsx';
import { formatTimestamp } from '@lib/events/index.ts';
import { SetSelect } from './SetSelect.tsx';
import SetManagementDropdown from './SetManagementDropdown.tsx';

interface Props {
  avFile: AudiovisualFile;
  fileType: 'Audio' | 'Video';
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
  sets: string[];
  title: string;
  event: Event;
  eventUuid: string;
  uuid: string;
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

const onSubmitAddAnno = async (newAnno: AnnotationEntry, baseUrl: string) => {
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
      caption_set: [],
    }),
  });

  if (res.ok) {
    window.location.reload();
  }
};

const onSubmitEditAnno = async (editAnno: AnnotationEntry, baseUrl: string) => {
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

const AvFile: React.FC<Props> = (props) => {
  const { t, lang } = props.i18n;

  const tabs = useMemo(
    () =>
      props.sets.map((uuid) => ({
        uuid,
        title: props.project.annotations[uuid].set,
      })),
    [props.sets]
  );

  const [set, setSet] = useState(tabs[0]);

  const [deleteAnnoUuid, setDeleteAnnoUuid] = useState<string | null>(null);
  const [editAnnoUuid, setEditAnnoUuid] = useState<string | null>(null);
  const [showAnnoCreateModal, setShowAnnoCreateModal] = useState(false);
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [search, setSearch] = useState('');
  // position of the most recently clicked annotation
  const [annoPosition, setAnnoPosition] = useState(0);

  // all annotation sets from this AV file
  const [allAnnotations, setAllAnnotations] = useState(
    Object.fromEntries(
      Object.entries(props.project.annotations).filter((ent) => {
        const anno = props.project.annotations[ent[0]];

        return anno.source_id === props.uuid;
      })
    )
  );

  const baseUrl = useMemo(
    () =>
      `/api/projects/${props.projectSlug}/events/${props.eventUuid}/annotations`,
    [props.projectSlug, props.eventUuid, set.uuid]
  );

  const setUrl = useMemo(() => `${baseUrl}/${set.uuid}`, [baseUrl, set.uuid]);

  const onCreateSet = async (name: string, avFileIn: string) => {
    const newSet = {
      event_id: props.eventUuid,
      set: name,
      source_id: avFileIn,
    };

    await onSubmitCreateSet(newSet, baseUrl);
  };

  const onExport = () =>
    exportAnnotations(allAnnotations[set.uuid].annotations, props.event);

  const onDelete = async () => {
    const res = await fetch(`${setUrl}/${deleteAnnoUuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      setAllAnnotations((oldAnnos) => {
        if (set.uuid) {
          const updatedEntry = oldAnnos[set.uuid];
          updatedEntry.annotations = updatedEntry.annotations.filter(
            (anno) => anno.uuid !== deleteAnnoUuid
          );

          return { ...oldAnnos, [set.uuid]: updatedEntry };
        } else {
          return {};
        }
      });
    }

    setDeleteAnnoUuid(null);
  };

  const onEdit = async (body: AnnotationEntry) => {
    const newAnno = await onSubmitEditAnno(body, setUrl);

    if (newAnno) {
      setAllAnnotations((oldAnnos) => {
        if (set.uuid) {
          const updatedSet = oldAnnos[set.uuid];
          updatedSet.annotations = updatedSet.annotations.map((anno) =>
            anno.uuid === newAnno.uuid ? newAnno : anno
          );

          return { ...oldAnnos, [set.uuid]: updatedSet };
        } else {
          return {};
        }
      });
    }

    setEditAnnoUuid(null);
  };

  const onCreate = async (body: AnnotationEntry) => {
    const newAnno = await onSubmitAddAnno(body, setUrl);

    if (newAnno && newAnno.length > 0) {
      setAllAnnotations((oldAnnos) => {
        if (set.uuid) {
          const updatedEntry = { ...oldAnnos[set.uuid] };
          updatedEntry.annotations.push(newAnno[0]);
          return { ...oldAnnos, [set.uuid]: updatedEntry };
        } else {
          return {};
        }
      });
    }

    setShowAnnoCreateModal(false);
  };

  // the annotations to display (can be limited via search)
  const displayAnnotations = useMemo(() => {
    if (search) {
      return sortAnnotations(
        searchAnnotations(allAnnotations[set.uuid].annotations, search)
      );
    } else {
      return sortAnnotations(allAnnotations[set.uuid].annotations);
    }
  }, [search, allAnnotations, set.uuid]);

  return (
    <>
      <div className='event-detail-content'>
        <h2>{`${props.title} (${formatTimestamp(
          props.avFile.duration,
          false
        )})`}</h2>
        <Player
          type={props.avFile.file_type || props.event.item_type || 'Audio'}
          i18n={props.i18n}
          offline={props.avFile.is_offline}
          url={props.avFile.file_url}
          position={annoPosition}
        />
        {props.fileType === 'Video' && props.event.citation && (
          <p className='citation'>{props.event.citation}</p>
        )}
      </div>
      {props.fileType === 'Audio' && (
        <>
          <Separator.Root className='SeparatorRoot' decorative />
          <Tabs currentTab={set} tabs={tabs} setTab={setSet} showDividers>
            <SetManagementDropdown
              setShowAddSetModal={setShowAddSetModal}
              editUrl={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/edit`}
              i18n={props.i18n}
            />
          </Tabs>
        </>
      )}
      <div className='annotation-table-container'>
        <AnnotationTableHeader
          eventUuid={props.eventUuid}
          displayAnnotations={displayAnnotations}
          fileType={props.fileType}
          i18n={props.i18n}
          onExport={onExport}
          projectSlug={props.projectSlug}
          setSearch={setSearch}
          setShowAnnoCreateModal={setShowAnnoCreateModal}
          setUuid={set.uuid}
        >
          {props.fileType === 'Video' && (
            <SetSelect
              editUrl={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/edit`}
              onChange={(set) => setSet(set)}
              sets={tabs}
              value={set}
              i18n={props.i18n}
              setShowAddSetModal={setShowAddSetModal}
            />
          )}
        </AnnotationTableHeader>
        <AnnotationTable
          i18n={props.i18n}
          displayAnnotations={displayAnnotations}
          project={props.project}
          setDeleteAnnoUuid={setDeleteAnnoUuid}
          setEditAnnoUuid={setEditAnnoUuid}
          setAnnoPosition={setAnnoPosition}
          projectSlug={props.projectSlug}
          eventUuid={props.eventUuid}
          setShowAnnoCreateModal={setShowAnnoCreateModal}
          tagPosition={props.fileType === 'Video' ? 'below' : 'column'}
          hideHeader={props.fileType === 'Video'}
          search={!!search}
        />
      </div>
      {props.fileType === 'Audio' && props.event.citation && (
        <p className='citation'>{props.event.citation}</p>
      )}
      {deleteAnnoUuid && (
        <DeleteModal
          name={t['Annotation']}
          i18n={props.i18n}
          onDelete={onDelete}
          onCancel={() => setDeleteAnnoUuid(null)}
        />
      )}
      {editAnnoUuid && (
        <AnnotationModal
          annotation={displayAnnotations.find(
            (ann) => ann.uuid === editAnnoUuid
          )}
          onClose={() => setEditAnnoUuid(null)}
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
          set={{
            source_id: props.uuid,
            event_id: props.eventUuid,
            annotations: [],
            set: '',
          }}
          avFileOptions={[
            {
              label: props.avFile.label,
              value: props.uuid,
            },
          ]}
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
    </>
  );
};

export default AvFile;
