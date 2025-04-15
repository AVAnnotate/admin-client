import type {
  AnnotationPage,
  AudiovisualFile,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import './SetsTable.css';
import { useCallback, useMemo, useState } from 'react';
import { Table } from '@components/Table/Table.tsx';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { Trash } from 'react-bootstrap-icons';
import { DeleteSetModal } from './DeleteSetModal.tsx';
import { SetFormModal } from '../../components/SetModal/SetModal.tsx';
import React from 'react';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
  eventId: string;

  onUpdateAVFile(avUUID: string, avFile: AudiovisualFile): void;
}

type SetWithUuid = AnnotationPage & {
  uuid: string;
};

export const SetsTable: React.FC<Props> = (props) => {
  const [deleteSet, setDeleteSet] = useState<SetWithUuid | null>(null);
  const [editSet, setEditSet] = useState<SetWithUuid | null>(null);

  const { lang, t } = props.i18n;

  const sets: SetWithUuid[] = useMemo(
    () =>
      Object.keys(props.project.annotations)
        .filter((k) => props.project.annotations[k].event_id === props.eventId)
        .map((uuid) => ({
          ...props.project.annotations[uuid],
          uuid,
        })),
    [props.project]
  );

  const getBaseUrl = useCallback(
    (set: SetWithUuid) =>
      `/api/projects/${props.projectSlug}/events/${set.event_id}/annotations/${set.uuid}`,
    []
  );

  const onEdit = async (
    newName: string,
    avFile: string,
    useForCaptions: boolean | undefined,
    speakerCategory: string | undefined
  ) => {
    if (editSet) {
      if (props.project.events[props.eventId].item_type === 'Video') {
        let file: AudiovisualFile = JSON.parse(
          JSON.stringify(
            props.project.events[props.eventId].audiovisual_files[avFile]
          )
        );

        if (file.caption_set) {
          let found = false;
          for (let i = 0; i < file.caption_set.length; i++) {
            if (file.caption_set[i].annotation_page_id === editSet.uuid) {
              if (useForCaptions) {
                file.caption_set[i].speaker_category = speakerCategory;
              } else {
                file.caption_set.splice(i, 1);
              }

              found = true;
            }
          }
          if (!found) {
            file.caption_set.push({
              annotation_page_id: editSet.uuid,
              speaker_category: speakerCategory,
            });
          }
        } else {
          file.caption_set = [
            {
              annotation_page_id: editSet.uuid,
              speaker_category: speakerCategory,
            },
          ];
        }

        props.onUpdateAVFile(avFile, file);
      }

      if (editSet.set !== newName) {
        const baseUrl = getBaseUrl(editSet);
        const res = await fetch(baseUrl, {
          body: JSON.stringify({ set: newName }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        });
      }
    }

    setEditSet(null);
  };

  // List of AV files that contain multiple sets. We can't allow deleting the only set
  // belonging to an AV file because it will lead to weird behavior in Event Detail.
  const multiSetAvFiles = useMemo(() => {
    const keys = Object.keys(props.project.annotations);

    const seen: string[] = [];
    const dupes: string[] = [];

    for (let i = 0; i < keys.length; i++) {
      const set = props.project.annotations[keys[i]];

      if (seen.includes(set.source_id)) {
        dupes.push(set.source_id);
      } else {
        seen.push(set.source_id);
      }
    }

    return dupes;
  }, [props.project]);

  const avFileOptions = useMemo(() => {
    const ret: { value: string; label: string }[] = [];

    Object.keys(props.project.events).forEach((key) => {
      const event = props.project.events[key];
      if (key === props.eventId) {
        Object.keys(event.audiovisual_files).forEach((avKey) => {
          ret.push({
            value: avKey,
            label: event.audiovisual_files[avKey].label,
          });
        });
      }
    });

    return ret;
  }, [props.project, props.eventId]);

  const speakerCategoryOptions = useMemo(() => {
    const ret: { value: string; label: string }[] = [];

    props.project.project.tags.tagGroups.forEach((group) => {
      ret.push({
        value: group.category,
        label: group.category,
      });
    });

    return ret;
  }, [props.project]);

  const hasCaptions = () => {
    if (!editSet) {
      return false;
    }
    return !!(
      props.project.events[editSet.event_id].audiovisual_files[
        editSet.source_id
      ].caption_set &&
      props.project.events[editSet.event_id].audiovisual_files[
        editSet.source_id
      ].caption_set?.find((s) => s.annotation_page_id === editSet.uuid)
    );
  };

  const getSpeakerCategory = () => {
    if (!editSet) {
      return undefined;
    }

    if (
      props.project.events[editSet.event_id].audiovisual_files[
        editSet.source_id
      ].caption_set
    ) {
      const found = props.project.events[editSet.event_id].audiovisual_files[
        editSet.source_id
      ].caption_set?.find((s) => s.annotation_page_id === editSet.uuid);

      if (found) {
        return found.speaker_category;
      }

      return undefined;
    }
  };

  return (
    <div className='sets-table-root'>
      {deleteSet && (
        <DeleteSetModal
          baseUrl={getBaseUrl(deleteSet)}
          i18n={props.i18n}
          onAfterSave={() => window.location.reload()}
          onCancel={() => setDeleteSet(null)}
          set={deleteSet}
        />
      )}
      {editSet && (
        <SetFormModal
          title={t['Edit Annotation Set']}
          i18n={props.i18n}
          onClose={() => setEditSet(null)}
          onSave={onEdit}
          set={editSet}
          avFileOptions={avFileOptions}
          isVideo={props.project.events[props.eventId].item_type === 'Video'}
          canEditAVFile={true}
          useForCaptions={hasCaptions()}
          speakerCategory={getSpeakerCategory()}
          speakerCategoryOptions={speakerCategoryOptions}
        />
      )}
      <div className='sets-container'>
        <div className='set-list'>
          <Table
            emptyText={t['_no_sets_message_']}
            items={sets}
            rows={[
              {
                className: 'set-name-cell',
                property: 'set',
                title: t['Name'],
                width: '40%',
              },
              {
                className: 'set-name-cell',
                property: (set: AnnotationPage) => {
                  const event = props.project.events[set.event_id];
                  const avFile = event.audiovisual_files[set.source_id];
                  console.log(set.source_id);
                  return avFile.label;
                },
                title: t['AV File'],
                width: '30%',
              },
              {
                className: 'set-name-cell',
                title: t['Number of Annotations'],
                width: '20%',
                property: (set: AnnotationPage) =>
                  `${set.annotations.length} ${t['Annotations']}`,
              },
              {
                className: 'set-name-cell',
                property: (set: SetWithUuid) => {
                  const event = props.project.events[set.event_id];
                  const avFile = event.audiovisual_files[set.source_id];
                  const found = avFile.caption_set
                    ? avFile.caption_set.find(
                        (s) => s.annotation_page_id === set.uuid
                      )
                    : undefined;
                  return found ? (
                    <div className='sets-table-captions-pill'>
                      {t['Captions']}
                    </div>
                  ) : (
                    ''
                  );
                },
                title: '',
                width: '10%',
              },
            ]}
            rowButtons={[
              {
                label: t['Edit'],
                onClick: (item: SetWithUuid) => setEditSet(item),
                icon: Pencil2Icon,
              },
              {
                label: t['Delete'],
                onClick: (item: SetWithUuid) => setDeleteSet(item),
                icon: Trash,
                displayCondition: (item: SetWithUuid) =>
                  multiSetAvFiles.includes(item.source_id),
              },
            ]}
            showHeaderRow={true}
          />
        </div>
      </div>
    </div>
  );
};
