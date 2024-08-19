import type { AnnotationPage, ProjectData, Translations } from '@ty/Types.ts';
import './Sets.css';
import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { useMemo } from 'react';
import { Button } from '@radix-ui/themes';
import { Table } from '@components/Table/Table.tsx';
import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

interface SetWithUuid extends AnnotationPage {
  uuid: string;
}

export const Sets: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  const sets: SetWithUuid[] = useMemo(
    () =>
      Object.keys(props.project.annotations).map((uuid) => ({
        ...props.project.annotations[uuid],
        uuid,
      })),
    [props.project]
  );

  return (
    <>
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
            <Button className='outline'>
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
            rowButtons={[]}
            showHeaderRow={false}
          />
        </div>
      </div>
    </>
  );
};
