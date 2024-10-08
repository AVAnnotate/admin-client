import {
  SelectInput,
  TextInput,
  TimeInput,
} from '@components/Formic/index.tsx';
import type { Event, FormEvent, Translations } from '@ty/Types.ts';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
import * as Separator from '@radix-ui/react-separator';
import type React from 'react';
import { Button } from '@radix-ui/themes';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import './EventForm.css';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { RichTextInput } from '@components/Formic/index.tsx';
import { generateDefaultEvent, getFileDuration } from '@lib/events/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';

interface Props {
  children?: React.ReactNode;
  event?: FormEvent;
  i18n: Translations;
  onSubmit: (data: Event | FormEvent) => any | Promise<any>;
  styles?: { [key: string]: any };
}

const initialAvFile = {
  label: '',
  is_offline: 'false',
  file_url: '',
  duration: 0,
};

export const EventForm: React.FC<Props> = (props) => {
  const onSubmit = async (data: FormEvent | Event) => {
    // convert the AV files' string values to boolean
    Object.keys(data.audiovisual_files).forEach((key) => {
      if (data.audiovisual_files[key].is_offline === 'true') {
        // @ts-ignore
        data.audiovisual_files[key].is_offline = true;
      } else if (data.audiovisual_files[key].is_offline === 'false') {
        // @ts-ignore
        data.audiovisual_files[key].is_offline = false;
      }
    });

    await props.onSubmit(data);
  };

  return (
    <Formik
      initialValues={props.event || generateDefaultEvent()}
      onSubmit={onSubmit}
    >
      <FormContents {...props} />
    </Formik>
  );
};

const FormContents: React.FC<Props> = ({ children, i18n, styles }) => {
  // map URLs to durations (in seconds)
  const [durationVals, setDurationVals] = useState<{ [key: string]: number }>(
    {}
  );

  const { t } = i18n;

  const { setFieldValue, values, isSubmitting } = useFormikContext();

  useEffect(() => {
    const updateDurations = async () => {
      const vals = values as FormEvent;

      const fileUrls = Object.keys(vals.audiovisual_files)
        .map((uuid) => vals.audiovisual_files[uuid].file_url)
        .filter(Boolean);

      const newDurationVals: { [key: string]: number } = { ...durationVals };

      // fill in durations for any URLs found
      for await (const url of fileUrls) {
        if (!newDurationVals[url]) {
          const duration = await getFileDuration(url);

          if (duration) {
            newDurationVals[url] = duration;
          }
        }
      }

      // set the duration for any AV files whose durations we've stored above
      Object.keys(vals.audiovisual_files).forEach((uuid) => {
        if (newDurationVals[vals.audiovisual_files[uuid].file_url]) {
          setFieldValue(
            `audiovisual_files.${uuid}.duration`,
            newDurationVals[vals.audiovisual_files[uuid].file_url]
          );
        }
      });

      setDurationVals(newDurationVals);
    };

    updateDurations();
  }, [(values as FormEvent).audiovisual_files]);

  return (
    <Form className='event-form' style={styles}>
      <div className='form-body'>
        <h2>{t['Event Information']}</h2>
        <TextInput label={t['Label']} name='label' required />
        <SelectInput
          label={t['Item Type']}
          name='item_type'
          options={[
            {
              label: t['Audio'],
              value: 'Audio',
            },
            {
              label: t['Video'],
              value: 'Video',
            },
          ]}
          required
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <h2>{t['Audiovisual File(s)']}</h2>
        <FieldArray
          name='audiovisual_files'
          render={() => (
            <div className='av-files-list'>
              {Object.keys((values as FormEvent).audiovisual_files).map(
                (key, idx) => {
                  return (
                    <div key={key} className='av-files-fields'>
                      <TextInput
                        className='av-label-input'
                        label={idx === 0 ? t['Label'] : undefined}
                        name={`audiovisual_files.${key}.label`}
                        required={idx === 0}
                      />
                      <div className='av-url-group'>
                        <SelectInput
                          className='av-select-type'
                          width='100px'
                          backgroundColor='var(--gray-200)'
                          label={idx === 0 ? t['File'] : undefined}
                          name={`audiovisual_files.${key}.is_offline`}
                          required={idx === 0}
                          options={[
                            { value: 'false', label: t['URL'] },
                            { value: 'true', label: t['Offline'] },
                          ]}
                        />
                        <TextInput
                          className='av-file-url-input'
                          name={`audiovisual_files.${key}.file_url`}
                          disabled={
                            (values as FormEvent).audiovisual_files[key]
                              .is_offline === 'true'
                              ? true
                              : false
                          }
                          placeholder={
                            (values as FormEvent).audiovisual_files[key]
                              .is_offline === 'true'
                              ? t['File Available Offline']
                              : undefined
                          }
                        />
                      </div>
                      <TimeInput
                        className='av-duration-input'
                        // disable input if we were able to automatically set the duration
                        disabled={
                          !!durationVals[
                            (values as FormEvent).audiovisual_files[key]
                              .file_url
                          ]
                        }
                        label={idx === 0 ? t['Duration'] : undefined}
                        // force this to re-render when the auto-duration thing picks up a value
                        key={
                          durationVals[
                            (values as FormEvent).audiovisual_files[key]
                              .file_url
                          ]
                        }
                        onChange={(input: number) =>
                          setFieldValue(
                            `audiovisual_files.${key}.duration`,
                            input
                          )
                        }
                        required
                        initialValue={
                          durationVals[
                            (values as FormEvent).audiovisual_files[key]
                              .file_url
                          ] ||
                          (values as FormEvent).audiovisual_files[key].duration
                        }
                      />
                      {idx !== 0 ? (
                        <Button
                          className='av-trash-button'
                          onClick={() => {
                            setFieldValue(
                              `audiovisual_files.${key}`,
                              undefined
                            );
                          }}
                          type='button'
                          variant='ghost'
                        >
                          <TrashIcon />
                        </Button>
                      ) : (
                        // show an empty div so the spacing stays consistent
                        <div className='av-trash-button'></div>
                      )}
                    </div>
                  );
                }
              )}
              <Button
                className='primary add-av-button'
                onClick={() =>
                  setFieldValue(`audiovisual_files.${uuidv4()}`, initialAvFile)
                }
                type='button'
              >
                <PlusIcon color='white' />
                {t['Add']}
              </Button>
            </div>
          )}
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <h2>{t['Other']}</h2>
        <RichTextInput
          elementTypes={['blocks', 'marks']}
          label={t['Description (Optional)']}
          helperText={t['A brief paragraph describing your event.']}
          name='description'
          i18n={i18n}
          initialValue={(values as FormEvent).description}
        />
        <TextInput label={t['Citation (Optional)']} name='citation' />
        {children}
      </div>
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
            disabled={isSubmitting}
            type='submit'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  );
};
