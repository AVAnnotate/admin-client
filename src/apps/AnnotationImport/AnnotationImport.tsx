import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { SelectInput } from '@components/Formic/index.tsx';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import {
  SpreadsheetInputContext,
  SpreadsheetInputContextComponent,
} from '@components/Formic/SpreadsheetInput/SpreadsheetInputContext.tsx';
import { LoadingOverlay } from '@components/LoadingOverlay/index.ts';
import { Button } from '@radix-ui/themes';
import type { Event, ProjectData, Translations, Tags } from '@ty/Types.ts';
import { Form, Formik, useFormikContext } from 'formik';
import { useContext, useMemo } from 'react';
import { mapAnnotationData } from '@lib/parse/index.ts';

import './AnnotationImport.css';

interface Props {
  event: Event;
  eventUuid: string;
  i18n: Translations;
  projectSlug: string;
  project: ProjectData;
}

interface FormData {
  annotations: {
    data: string[][];
    headers: string[];
  };
  set: string;
}

const onSubmit = async (
  body: FormData,
  headerMap: { [key: string]: number },
  baseUrl: string,
  redirectUrl: string,
  tags: Tags,
  projectSlug: string
) => {
  const annos = await mapAnnotationData(
    body.annotations.data,
    headerMap,
    tags,
    projectSlug
  );

  const res = await fetch(`${baseUrl}/${body.set}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(annos),
  });

  if (res.ok) {
    window.location.href = redirectUrl;
  }
};

export const AnnotationImport: React.FC<Props> = (props) => {
  return (
    <SpreadsheetInputContextComponent>
      <AnnotationImportForm {...props} />
    </SpreadsheetInputContextComponent>
  );
};

export const AnnotationImportForm: React.FC<Props> = (props) => {
  const { headerMap } = useContext(SpreadsheetInputContext);

  const { lang } = props.i18n;

  const baseUrl = useMemo(
    () =>
      `/api/projects/${props.projectSlug}/events/${props.eventUuid}/annotations`,
    [props.projectSlug, props.eventUuid]
  );

  const redirectUrl = useMemo(
    () => `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}`,
    [lang, props.projectSlug, props.eventUuid]
  );

  const setOptions = useMemo(
    () =>
      Object.keys(props.project.annotations)
        .filter(
          (uuid) => props.project.annotations[uuid].event_id === props.eventUuid
        )
        .map((uuid) => ({
          label: `${
            props.project.events[props.project.annotations[uuid].event_id].label
          } - ${props.project.annotations[uuid].set}`,
          value: uuid,
        })),
    []
  );

  const initialValues: FormData = useMemo(
    () => ({
      annotations: { data: [], headers: [] },
      set: setOptions[0].value,
    }),
    []
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (data) =>
        await onSubmit(
          data,
          headerMap,
          baseUrl,
          redirectUrl,
          props.project.project.tags,
          props.projectSlug
        )
      }
    >
      <AnnotationImportFormContents
        {...props}
        redirectUrl={redirectUrl}
        setOptions={setOptions}
      />
    </Formik>
  );
};

interface FormContentsProps extends Props {
  redirectUrl: string;
  setOptions: { label: string; value: string }[];
}

const AnnotationImportFormContents: React.FC<FormContentsProps> = (props) => {
  const { isSubmitting } = useFormikContext();

  const { lang, t } = props.i18n;

  const { requiredFieldsSet } = useContext(SpreadsheetInputContext);

  const importAsOptions = useMemo(
    () => [
      {
        label: t['Start Time'],
        required: true,
        value: 'start_time',
      },
      {
        label: t['End Time'],
        required: true,
        value: 'end_time',
      },
      {
        label: t['Annotation'],
        required: true,
        value: 'annotation',
      },
      {
        label: t['Tags (vertical bar separated)'],
        required: true,
        value: 'tags',
      },
    ],
    []
  );

  return (
    <Form className='annotation-import-form'>
      <Breadcrumbs
        items={[
          { label: t['Projects'], link: `/${lang}/projects` },
          {
            label: props.project.project.title,
            link: `/${lang}/projects/${props.projectSlug}`,
          },
          {
            label: props.event.label,
            link: `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}`,
          },
          {
            label: t['Import Annotation File'],
          },
        ]}
      />
      <div className='container'>
        {isSubmitting && <LoadingOverlay />}
        <h1>{t['Import Annotations']}</h1>
        <div className='av-label annotation-import-instructions'>
          {
            t[
              'Upload a .tsv, .csv, .xlsx, or tab-separated .txt file of annotations that correspond with your project’s audiovisual item. If you have multiple annotation layers, upload them individually.'
            ]
          }
        </div>
        <div className='spreadsheet-input-container'>
          <SpreadsheetInput
            i18n={props.i18n}
            importAsOptions={importAsOptions}
            name='annotations'
          />
        </div>
        <div className='set-container'>
          <SelectInput
            label={'Annotation Set'}
            name='set'
            options={props.setOptions}
            required
          />
        </div>
      </div>
      <BottomBar>
        <div className='bottom-bar-flex'>
          <Button
            className='outline cancel-button'
            onClick={() => (window.location.href = props.redirectUrl)}
            type='button'
          >
            {t['cancel']}
          </Button>
          <Button
            className='primary save-button'
            disabled={!requiredFieldsSet}
            type='submit'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  );
};
