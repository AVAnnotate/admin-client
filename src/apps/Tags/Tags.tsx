import type { ProjectData, Translations } from '@ty/Types.ts';
import { NoTags } from './NoTags.tsx';
import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import { mapTagData } from '@lib/parse/index.ts';
import './Tags.css';

export interface TagsProps {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const Tags = (props: TagsProps) => {
  const { t, lang } = props.i18n;

  const { tags } = props.project.project;

  const handleAddTagGroup = () => {};

  const handleImportTags = (
    data: any[],
    headerMap: { [key: string]: number }
  ) => {
    const project: ProjectData = JSON.parse(JSON.stringify(props.project));

    project.project.tags = mapTagData(data, headerMap);

    console.log('Project: ', project);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Tags'], link: '' },
        ]}
      />
      <div className='tags-container'>
        <h1>{t['Tags']}</h1>
        {!tags || tags?.tagGroups.length === 0 ? (
          <NoTags
            i18n={props.i18n}
            onAddTagGroup={handleAddTagGroup}
            onImportTags={handleImportTags}
          />
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};
