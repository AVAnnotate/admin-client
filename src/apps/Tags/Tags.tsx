import type { ProjectData, Translations } from '@ty/Types.ts';
import { NoTags } from './NoTags.tsx';
import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import './Tags.css';

export interface TagsProps {
  i18n: Translations;
  project: ProjectData;
}

export const Tags = (props: TagsProps) => {
  const { t, lang } = props.i18n;

  const { tags } = props.project.project;

  const handleAddTagGroup = () => {};

  const handleImportTags = () => {};
  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.project.project.github_org}+${props.project.project.slug}`,
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
