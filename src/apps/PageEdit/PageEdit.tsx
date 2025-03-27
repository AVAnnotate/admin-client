import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs.tsx';
import { PageForm } from '@components/PageForm/PageForm.tsx';
import type { FormPage, Page, ProjectData, Translations } from '@ty/Types.ts';
import { useCallback } from 'react';

interface Props {
  i18n: Translations;
  page?: Page;
  project: ProjectData;
  projectSlug: string;
  uuid?: string;
}

const onSubmitNew = async (page: Page | FormPage, projectSlug: string) => {
  await fetch(`/api/projects/${projectSlug}/pages`, {
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
  await fetch(`/api/projects/${projectSlug}/pages/${uuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page }),
  });
};

export const PageEdit: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  const onSubmit = useCallback(async (page: Page | FormPage) => {
    if (props.uuid) {
      await onSubmitEdit(page, props.projectSlug, props.uuid);
    } else {
      await onSubmitNew(page, props.projectSlug);
    }

    // Should probably redirect to the page view component once that's built.
    window.location.pathname = `/${lang}/projects/${props.projectSlug}`;
  }, []);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Add Page'], link: '' },
        ]}
      />
      <div className='container' style={{ paddingTop: 70 }}>
        <PageForm {...props} onSubmit={onSubmit} />
      </div>
    </>
  );
};
