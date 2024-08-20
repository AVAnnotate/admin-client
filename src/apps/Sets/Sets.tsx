import type { AnnotationPage, ProjectData, Translations } from '@ty/Types.ts';
import './Sets.css';
import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Table } from '@components/Table/Table.tsx';
import { Pencil2Icon, PlusIcon } from '@radix-ui/react-icons';
import { Trash } from 'react-bootstrap-icons';
import { DeleteSetModal } from './DeleteSetModal.tsx';
import { SetFormModal } from './SetModal.tsx';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

interface SetWithUuid extends AnnotationPage {
  uuid: string;
}

export const Sets: React.FC<Props> = (props) => {
  const [createSet, setCreateSet] = useState(false);
  const [deleteSet, setDeleteSet] = useState<SetWithUuid | null>(null);
  const [editSet, setEditSet] = useState<SetWithUuid | null>(null);

  const { lang, t } = props.i18n;

  const sets: SetWithUuid[] = useMemo(
    () =>
      Object.keys(props.project.annotations).map((uuid) => ({
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

  return (
    <>
      {createSet && (
        <SetFormModal
          title={t['Create Annotation Set']}
          i18n={props.i18n}
          onClose={() => setCreateSet(false)}
        />
      )}
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
          set={editSet}
        />
      )}
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Sets'], link: '' },
        ]}
      />
      <div className='container sets-container'>
        <div className='top-bar'>
          <h1>{t['Annotation Sets']}</h1>
          <div>
            <Button className='primary' onClick={() => setCreateSet(true)}>
              <PlusIcon />
              {t['Add']}
            </Button>
          </div>
        </div>
        <div className='set-list'>
          <Table
            emptyText={t['No sets have been added']}
            items={sets}
            rows={[
              {
                className: 'set-name-cell',
                property: 'set',
                title: t['Title'],
                width: '75%',
              },
              {
                title: t['Count'],
                property: (set: AnnotationPage) =>
                  `${set.annotations.length} ${t['Annotations']}`,
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
              },
            ]}
            showHeaderRow={false}
          />
        </div>
      </div>
    </>
  );
};
