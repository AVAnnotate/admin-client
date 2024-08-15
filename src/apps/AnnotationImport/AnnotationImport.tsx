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
import type {
  AnnotationEntry,
  Event,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
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

const initialValues = { annotations: { data: [], headers: [] }, set: '' } as {
  annotations: {
    data: string[][];
    headers: string[];
  };
  set: string;
};

// todo: translate 00:00:00 timestamps to number of seconds
// todo: translate comma-separated tags into tag objects
const onSubmit = async (
  body: typeof initialValues,
  headerMap: { [key: string]: number },
  baseUrl: string,
  redirectUrl: string
) => {
  const annos = mapAnnotationData(body.annotations.data, headerMap);

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

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (data) =>
        await onSubmit(data, headerMap, baseUrl, redirectUrl)
      }
    >
      <AnnotationImportFormContents {...props} redirectUrl={redirectUrl} />
    </Formik>
  );
};

interface FormContentsProps extends Props {
  redirectUrl: string;
}

const AnnotationImportFormContents: React.FC<FormContentsProps> = (props) => {
  const { isSubmitting, values } = useFormikContext();

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
        label: t['Tags (comma separated)'],
        required: true,
        value: 'tags',
      },
    ],
    []
  );

  const setOptions = useMemo(() => {
    return Object.keys(props.project.annotations)
      .filter(
        (uuid) => props.project.annotations[uuid].event_id === props.eventUuid
      )
      .map((uuid) => ({
        label: props.project.annotations[uuid].set,
        value: uuid,
      }));
  }, []);

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
        <div className='spreadsheet-input-container'>
          <SpreadsheetInput
            i18n={props.i18n}
            importAsOptions={importAsOptions}
            name='annotations'
          />
        </div>
        <SelectInput
          label={'Annotation Set'}
          name='set'
          options={setOptions}
          required
        />
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
