import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import { PageForm } from '@components/PageForm/PageForm.tsx';
import type { FormPage, Page, ProjectData, Translations } from '@ty/Types.ts';
import { useCallback, useMemo } from 'react';

interface Props {
  i18n: Translations;
  page?: Page;
  project: ProjectData;
  uuid?: string;
}

const onSubmitNew = async (page: Page | FormPage, projectSlug: string) => {
  const res = await fetch(`/api/projects/${projectSlug}/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page }),
  });
};

const onSubmitEdit = async (
  page: Page | FormPage,
  projectSlug: string,
  uuid: string
) => {
  const res = await fetch(`/api/projects/${projectSlug}/pages/${uuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page }),
  });
};

export const PageEdit: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  const projectSlug = useMemo(
    () => `${props.project.project.github_org}+${props.project.project.slug}`,
    [props.project]
  );

  const onSubmit = useCallback(async (page: Page | FormPage) => {
    if (props.uuid) {
      await onSubmitEdit(page, projectSlug, props.uuid);
    } else {
      await onSubmitNew(page, projectSlug);
    }

    // Should probably redirect to the page view component once that's built.
    window.location.pathname = `/${lang}/projects/${projectSlug}`;
  }, []);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${projectSlug}`,
          },
          { label: t['Add Page'], link: '' },
        ]}
      />
      <div className='container'>
        <PageForm {...props} onSubmit={onSubmit} />
      </div>
    </>
  );
};
