import type {
  AnnotationPage,
  AudiovisualFile,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
import './SetsTable.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { Trash } from 'react-bootstrap-icons';
import { DeleteSetModal } from './DeleteSetModal.tsx';
import { SetFormModal } from '../../components/SetModal/SetModal.tsx';
import React from 'react';
import { DragTable } from '@components/DragTable/DragTable.tsx';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';
import { Button } from '@radix-ui/themes';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
  eventId: string;
  avFileId: string;

  onUpdateAVFile(avUUID: string, avFile: AudiovisualFile): void;
  onAddSet(avFileId: string): void;
}

type SetWithUuid = AnnotationPage & {
  uuid: string;
};

export const SetsTable: React.FC<Props> = (props) => {
  const [deleteSet, setDeleteSet] = useState<SetWithUuid | null>(null);
  const [editSet, setEditSet] = useState<SetWithUuid | null>(null);
  const [sort, setSort] = useState<string[]>([]);

  const { t } = props.i18n;

  const label =
    props.project.events[props.eventId].audiovisual_files[props.avFileId].label;

  useEffect(() => {
    const avFile: AudiovisualFile =
      props.project.events[props.eventId].audiovisual_files[props.avFileId];

    if (avFile.set_sort && avFile.set_sort.length > 0) {
      setSort(avFile.set_sort);
    } else {
      const srt: string[] = [];
      Object.keys(props.project.annotations).forEach((id) => {
        const anno = props.project.annotations[id];
        if (anno.source_id === props.avFileId) {
          srt.push(id);
        }
      });
      setSort(srt);
    }
  }, []);

  // List of AV files that contain multiple sets. We can't allow deleting the only set
  // belonging to an AV file because it will lead to weird behavior in Event Detail.
  const multiSetAvFiles = () => {
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
  };

  const meatballOptions = (uuid: string) => {
    const annos: AnnotationPage = props.project.annotations[uuid];

    const options = [
      {
        // @ts-ignore
        label: t['Edit'],
        icon: Pencil2Icon,
        onClick: () => setEditSet({ ...props.project.annotations[uuid], uuid }),
      },
    ];

    if (multiSetAvFiles().includes(annos.source_id)) {
      options.push({
        label: t['Delete'],
        onClick: () =>
          setDeleteSet({ ...props.project.annotations[uuid], uuid }),
        // @ts-ignore
        icon: Trash,
      });
    }

    return options;
  };

  const rows = sort
    .filter(
      (k) =>
        props.project.annotations[k].event_id === props.eventId &&
        props.project.annotations[k].source_id === props.avFileId
    )
    .map((uuid) => {
      const anno = props.project.annotations[uuid];
      const set =
        props.project.events[anno.event_id].audiovisual_files[anno.source_id]
          .caption_set;
      let captions = false;
      if (set && set.find((c) => c.annotation_page_id === uuid)) {
        captions = true;
      }
      return {
        id: uuid,
        component: (
          <>
            <div className='av-label set-label'>{anno.set}</div>
            <div className='av-label set-label'>{`${anno.annotations.length} ${t['Annotations']}`}</div>
            <div>
              {captions ? (
                <div className='sets-table-captions-pill'>{t['Captions']}</div>
              ) : (
                <div />
              )}
            </div>
            <MeatballMenu
              buttons={meatballOptions(uuid)}
              row={anno}
              aria-label='annotation set options'
            />
          </>
        ),
      };
    });

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
      if (
        props.project.events[props.eventId].audiovisual_files[avFile]
          .file_type === 'Video'
      ) {
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

  const handleDrop = (pickedUp: any) => {
    if (pickedUp) {
      // ignore if we're dropping in the same spot it came from
      if (pickedUp.hoverIndex === pickedUp.originalIndex) {
        return;
      }

      let newArray = sort.filter((k) => k !== pickedUp.uuid);

      newArray.splice(pickedUp.hoverIndex, 0, pickedUp.uuid);

      setSort(newArray);

      const file: AudiovisualFile = {
        ...props.project.events[props.eventId].audiovisual_files[
          props.avFileId
        ],
        set_sort: newArray,
      };

      props.onUpdateAVFile(props.avFileId, file);
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
          isVideo={
            props.project.events[props.eventId].audiovisual_files[
              editSet.source_id
            ].file_type
              ? props.project.events[props.eventId].audiovisual_files[
                  editSet.source_id
                ].file_type === 'Video'
              : props.project.events[props.eventId].item_type === 'Video'
          }
          canEditAVFile={true}
          useForCaptions={hasCaptions()}
          speakerCategory={getSpeakerCategory()}
          speakerCategoryOptions={speakerCategoryOptions}
        />
      )}
      <div className='sets-container'>
        <div className='set-list'>
          <DragTable
            rows={rows}
            entries={[
              {
                label: label,
                gridWidth: '2fr',
              },
              {
                label: '',
                gridWidth: '1fr',
              },
              {
                label: '',
                gridWidth: '100px',
              },
              {
                label: '',
                gridWidth: '40px',
              },
            ]}
            onDrop={handleDrop}
            addButton={
              <Button
                className='primary set-add-av-button'
                onClick={() => props.onAddSet(props.avFileId)}
                type='button'
                disabled={!props.eventId}
              >
                <PlusIcon color='white' />
                {t['Add']}
              </Button>
            }
            emptyMessage={t['_empty_av_files_message_']}
          />
        </div>
      </div>
    </div>
  );
};
