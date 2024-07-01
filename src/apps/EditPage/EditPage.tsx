import { PageForm } from '@components/PageForm/PageForm.tsx';
import type { Page, ProjectData, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';

interface Props {
  i18n: Translations;
  page?: Page;
  project: ProjectData;
}

export const NewPage: React.FC<Props> = (props) => {
  const projectSlug = useMemo(
    () => `${props.project.project.gitHubOrg}+${props.project.project.slug}`,
    [props.project]
  );

  return <PageForm />;
};
