import type { ProjectData, Translations } from '@ty/Types.ts';
import './SiteBuilder.css';
import { PageList } from '@components/PageList/PageList.tsx';
import { Button } from '@radix-ui/themes';
import { PlusIcon } from '@radix-ui/react-icons';
import { EmptyDashboard } from '@components/EmptyDashboard/index.ts';
import { DropdownButton } from '@components/DropdownButton/DropdownButton.tsx';
import {
  FileEarmark,
  FileEarmarkRichtext,
  WindowSidebar,
} from 'react-bootstrap-icons';
import {
  AutoGenerateModal,
  type AutoGenerateOptions,
} from '@components/AutoGenerateModal/AutoGenerateModal.tsx';
import { useState } from 'react';
import {
  PublishModal,
  type PublishOptions,
} from '@components/PublishModal/PublishModal.tsx';

interface SiteBuilderProps {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

export const SiteBuilder = (props: SiteBuilderProps) => {
  const [autogenOpen, setAutogenOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const handleUpdateAutoGenerate = async (options: AutoGenerateOptions[]) => {
    const result = await fetch(
      `/api/projects/${props.projectSlug}/pages/auto`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          options: options,
        }),
      }
    );

    if (result.ok) {
      const url = new URL(window.location.href);
      window.location.href = url.href;
    }

    setAutogenOpen(false);
  };

  const handlePublishSite = async (options: PublishOptions) => {
    const result = await fetch(`/api/projects/${props.projectSlug}/publish`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publish_pages: options.publishPages,
        publish_static: options.publishStatic,
      }),
    });

    if (result.ok) {
      const url = new URL(window.location.href);
      window.location.href = url.href;
    }

    setPublishOpen(false);
  };

  const { t, lang } = props.i18n;
  return (
    <div className='site-builder-container'>
      <div className='site-builder-topbar'>
        <h1>{t['All Web Pages']}</h1>
        <div className='site-builder-action-buttons'>
          <Button
            className='primary site-builder-button'
            onClick={() => setPublishOpen(true)}
          >
            <WindowSidebar />
            {t['Publish Site']}
          </Button>
          <DropdownButton
            title={t['Add Page']}
            titleIcon={<PlusIcon />}
            items={[
              {
                label: t['Blank page'],
                icon: <FileEarmark />,
                onClick: () =>
                  (window.location.href = `/${lang}/projects/${props.projectSlug}/pages/new`),
              },
              {
                label: t['Auto-generated page'],
                icon: <FileEarmarkRichtext />,
                onClick: () => setAutogenOpen(true),
              },
            ]}
          />
        </div>
      </div>
      {Object.keys(props.project.pages).length === 0 ? (
        <EmptyDashboard description={t['No pages have been added']}>
          <Button
            className='primary site-builder-button'
            onClick={() => setAutogenOpen(true)}
          >
            <FileEarmarkRichtext />
            {t['Add auto-generated page']}
          </Button>
          <Button
            className='outline site-builder-button'
            onClick={() =>
              (window.location.href = `/${lang}/projects/${props.projectSlug}/pages/new`)
            }
          >
            <FileEarmark />
            {t['Add blank page']}
          </Button>
        </EmptyDashboard>
      ) : (
        <PageList
          project={props.project}
          i18n={props.i18n}
          projectSlug={props.projectSlug}
        />
      )}
      <AutoGenerateModal
        project={props.project}
        i18n={props.i18n}
        open={autogenOpen}
        onClose={() => setAutogenOpen(false)}
        onUpdateAutoGenerate={handleUpdateAutoGenerate}
      />
      <PublishModal
        i18n={props.i18n}
        open={publishOpen}
        project={props.project}
        onClose={() => setPublishOpen(false)}
        onPublishSite={handlePublishSite}
      />
    </div>
  );
};
