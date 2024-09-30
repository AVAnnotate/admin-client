import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Form, Formik } from 'formik';
import type React from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './EventImport.css';
import { ToggleInput } from '@components/Formic/index.tsx';
import { BottomBar } from '@components/BottomBar/index.ts';
import { Button } from '@radix-ui/themes';
import { mapEventData } from '@lib/parse/index.ts';
import * as Separator from '@radix-ui/react-separator';
import {
  SpreadsheetInputContext,
  SpreadsheetInputContextComponent,
} from '@components/Formic/SpreadsheetInput/SpreadsheetInputContext.tsx';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { deserialize } from '@lib/slate/deserialize.ts';
import { getFileDuration } from '@lib/events/index.ts';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

const initialValues = {
  autogenerate_web_pages: true,
  events: {
    data: [],
    headers: [],
  },
};

export const EventImport: React.FC<Props> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerMap, setHeaderMap] = useState({});
  const [saving, setSaving] = useState(false);

  const { lang, t } = props.i18n;

  const onSubmit = useCallback(
    async (data: any) => {
      setIsSubmitting(true);

      const events = mapEventData(
        data.events.data,
        headerMap,
        data.autogenerate_web_pages
      );

      for await (const ev of events) {
        if (ev.description) {
          const template = document.createElement('description');
          template.innerHTML = ev.description as unknown as string;
          ev.description = deserialize(template);
        }

        for await (const afUuid of Object.keys(ev.audiovisual_files)) {
          const file = ev.audiovisual_files[afUuid];

          if (!file.duration) {
            const duration = await getFileDuration(file.file_url);

            if (!duration) {
              throw new Error(`Unable to determine duration for ${file.label}`);
            }

            file.duration = duration;
          }
        }
      }

      setSaving(true);
      const res = await fetch(`/api/projects/${props.projectSlug}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      setIsSubmitting(false);
      setSaving(false);

      window.location.pathname = `/${lang}/projects/${props.projectSlug}`;
    },
    [headerMap]
  );

  const handleHeaderMapChange = (map: { [key: string]: number }) => {
    setHeaderMap(map);
  };

  return (
    <div className='event-import-container'>
      {saving && <LoadingOverlay />}
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          { label: t['Edit Event'], link: '' },
        ]}
      />
      <div className='container'>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          <SpreadsheetInputContextComponent>
            <FormContents
              {...props}
              isSubmitting={isSubmitting}
              onHeaderMapChange={handleHeaderMapChange}
            />
          </SpreadsheetInputContextComponent>
        </Formik>
      </div>
    </div>
  );
};

interface FormContentsProps extends Props {
  isSubmitting: boolean;
  onHeaderMapChange(headerMap: { [key: string]: number }): void;
}

export const FormContents: React.FC<FormContentsProps> = (props) => {
  const { t } = props.i18n;

  const importAsOptions = useMemo(
    () => [
      {
        label: t['Event Label'],
        required: true,
        value: 'label',
      },
      {
        label: t['Event Description'],
        value: 'description',
      },
      {
        label: t['Event Item Type'],
        required: true,
        value: 'item_type',
      },
      {
        label: t['AV File Label'],
        required: true,
        value: 'audiovisual_file_label',
      },
      {
        label: t['AV File URL'],
        required: true,
        value: 'audiovisual_file_url',
      },
      {
        label: t['Event Citation'],
        value: 'citation',
      },
    ],
    []
  );

  const { requiredFieldsSet, headerMap, imported } = useContext(
    SpreadsheetInputContext
  );

  useEffect(() => {
    if (headerMap) {
      props.onHeaderMapChange(headerMap);
    }
  }, [headerMap]);
  return (
    <>
      <Form className='event-import-form'>
        <h1>{t['Import events file']}</h1>
        <p>
          {
            t[
              "Upload a .tsv, .csv, .xlsx, or tab-separated .txt file of annotations that correspond with your project's events."
            ]
          }
        </p>
        <SpreadsheetInput
          accept='.tsv, .csv, .xlsx, .txt'
          i18n={props.i18n}
          label={t['Events file']}
          name='events'
          importAsOptions={importAsOptions}
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <ToggleInput
          helperText={
            t[
              'Selecting this will create a webpage for your event. You can edit or delete this page at any point in the Pages tab.'
            ]
          }
          label={t['Auto-generate web page for this event?']}
          name='autogenerate_web_pages'
        />
        <BottomBar>
          <div className='bottom-bar-flex'>
            <Button
              className='cancel-button outline'
              onClick={() => history.back()}
              type='button'
              variant='outline'
            >
              {t['cancel']}
            </Button>
            <Button
              className='save-button primary'
              disabled={props.isSubmitting || !requiredFieldsSet || !imported}
              type='submit'
            >
              {t['save']}
            </Button>
          </div>
        </BottomBar>
      </Form>
    </>
  );
};
