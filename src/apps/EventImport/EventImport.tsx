import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput.tsx';
import type { ProjectData, Translations } from '@ty/Types.ts';
import { Form, Formik, useFormikContext } from 'formik';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import './EventImport.css';
import { ToggleInput } from '@components/Formic/index.tsx';
import { BottomBar } from '@components/BottomBar/index.ts';
import { Button } from '@radix-ui/themes';
import { mapEventData } from '@lib/parse/index.ts';
import * as Separator from '@radix-ui/react-separator';

interface Props {
  i18n: Translations;
  project: ProjectData;
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

  const { lang, t } = props.i18n;

  const projectSlug = useMemo(
    () => `${props.project.project.gitHubOrg}+${props.project.project.slug}`,
    [props.project]
  );

  const onSubmit = useCallback(async (data: any) => {
    setIsSubmitting(true);

    const events = mapEventData(
      data.events.data,
      data.headerMap,
      data.autogenerate_web_pages
    );

    events.forEach((ev) => {
      if (ev.description) {
        ev.description = [
          {
            type: 'paragraph',
            children: [{ text: ev.description as unknown as string }],
          },
        ];
      }
    });

    const res = await fetch(`/api/projects/${projectSlug}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    });

    setIsSubmitting(false);

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
          { label: t['Edit Event'], link: '' },
        ]}
      />
      <div className='container'>
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          <FormContents {...props} isSubmitting={isSubmitting} />
        </Formik>
      </div>
    </>
  );
};

interface FormContentsProps extends Props {
  isSubmitting: boolean;
}

export const FormContents: React.FC<FormContentsProps> = (props) => {
  const [headerMap, setHeaderMap] = useState({});

  const { t } = props.i18n;

  const importAsOptions = useMemo(
    () => [
      {
        label: t['Audiovisual file label'],
        required: true,
        value: 'audiovisual_file_label',
      },
      {
        label: t['Audiovisual file URL'],
        required: true,
        value: 'audiovisual_file_url',
      },
      {
        label: t['Audiovisual file duration'],
        required: true,
        value: 'audiovisual_file_duration',
      },
      {
        label: t['Item Type'],
        required: true,
        value: 'item_type',
      },
      {
        label: t['Label'],
        required: true,
        value: 'label',
      },
      {
        label: t['Description'],
        value: 'description',
      },
      {
        label: t['Citation'],
        value: 'citation',
      },
    ],
    []
  );

  const { values }: { values: typeof initialValues } = useFormikContext();

  // Check whether all the required fields are mapped
  // to something in the spreadsheet.
  const requiredFieldsSet = useMemo(() => {
    const requiredFields = importAsOptions.filter((f) => f.required);
    const selectedFields = Object.keys(headerMap);

    return (
      requiredFields.filter((f) => !selectedFields.includes(f.value)).length ===
      0
    );
  }, [values]);

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
          headerMap={headerMap}
          setHeaderMap={setHeaderMap}
          importAsOptions={importAsOptions}
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <ToggleInput
          helperText={t['lorem']}
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
              disabled={props.isSubmitting || !requiredFieldsSet}
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
