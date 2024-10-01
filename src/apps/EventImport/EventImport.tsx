import { Breadcrumbs } from '@components/Breadcrumbs/index.ts';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import type { FormEvent, ProjectData, Translations } from '@ty/Types.ts';
import { Form, Formik, useFormikContext } from 'formik';
import React from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './EventImport.css';
import { TimeInput, ToggleInput } from '@components/Formic/index.tsx';
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
import * as Dialog from '@radix-ui/react-dialog';

interface Props {
  i18n: Translations;
  project: ProjectData;
  projectSlug: string;
}

const initialValues = {
  autogenerate_web_pages: true,
  events: {
    data: [] as string[][],
    headers: [] as string[],
  },
  body: [] as FormEvent[],
};

export const EventImport: React.FC<Props> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerMap, setHeaderMap] = useState({});
  const [saving, setSaving] = useState(false);

  const { lang, t } = props.i18n;

  const onSubmit = useCallback(
    async (data: typeof initialValues) => {
      const body = JSON.stringify({ events: data.body });

      setIsSubmitting(true);

      setSaving(true);

      const _res = await fetch(`/api/projects/${props.projectSlug}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
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
  // array of indexes of events whose AV files we failed to fetch durations for
  const [failedDurations, setFailedDurations] = useState<number[]>([]);

  // whether all the durations are auto-populated
  const [goodDurations, setGoodDurations] = useState(false);

  const [saving, setSaving] = useState(false);

  const { t } = props.i18n;

  const { setFieldValue, submitForm, values } = useFormikContext();

  const transformData = async (data: any) => {
    setSaving(true);

    const events = mapEventData(
      data.events.data,
      headerMap,
      data.autogenerate_web_pages
    );

    const failed: number[] = [];

    for await (const [idx, ev] of events.entries()) {
      if (ev.description) {
        const template = document.createElement('description');
        template.innerHTML = ev.description as unknown as string;
        ev.description = deserialize(template);
      }

      for await (const afUuid of Object.keys(ev.audiovisual_files)) {
        const file = ev.audiovisual_files[afUuid];

        console.log('hello');
        const duration = await getFileDuration(file.file_url);

        if (duration) {
          file.duration = duration;
        } else {
          failed.push(idx);
        }
      }
    }

    await setFieldValue('body', events);

    setSaving(false);

    if (failed.length > 0) {
      setFailedDurations(failed);
      setGoodDurations(false);
    } else {
      setGoodDurations(true);
      return true;
    }
  };

  // submitForm will submit the previous state of the form if we call it within
  // the same function that we updated the body value in, so we need to make sure
  // another render happens before submitting :/
  useEffect(() => {
    if (goodDurations) {
      submitForm();
    }
  }, [goodDurations]);

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
      {saving && <LoadingOverlay />}
      <Form className='event-import-form'>
        {failedDurations.length > 0 && (
          <Dialog.Root open>
            <Dialog.Portal>
              <Dialog.Overlay className='dialog-overlay' />
              <Dialog.Content className='dialog-content event-import-duration-dialog-content'>
                <Dialog.Title className='dialog-title'>
                  {t['Duration']}
                </Dialog.Title>
                <Dialog.Description className='dialog-description'>
                  {
                    t[
                      'We were unable to fetch the duration of the following file(s). Please enter them below.'
                    ]
                  }
                </Dialog.Description>
                {failedDurations.map((idx) => {
                  const event = (values as typeof initialValues).body[idx];
                  const avFileUuid = Object.keys(event.audiovisual_files)[0];

                  return (
                    <React.Fragment key={idx}>
                      <label>{event.label}</label>
                      <TimeInput
                        initialValue={0}
                        onChange={async (val) =>
                          await setFieldValue(
                            `body[${idx}].audiovisual_files.${avFileUuid}.duration`,
                            val
                          )
                        }
                      />
                    </React.Fragment>
                  );
                })}
                <div className='dialog-close-bar'>
                  <Dialog.Close asChild>
                    <Button
                      className='unstyled'
                      onClick={() => setFailedDurations([])}
                      role='button'
                    >
                      {t['cancel']}
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button
                      className='primary'
                      role='button'
                      onClick={submitForm}
                    >
                      {t['save']}
                    </Button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
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
              onClick={async () => await transformData(values)}
              type='button'
            >
              {t['save']}
            </Button>
          </div>
        </BottomBar>
      </Form>
    </>
  );
};
