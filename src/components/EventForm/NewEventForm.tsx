import {
  SelectInput,
  TextInput,
  DurationInput,
} from '@components/Formic/index.tsx';
import type {
  AudiovisualFile,
  Event,
  FormEvent,
  ProjectData,
  Translations,
} from '@ty/Types.ts';
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
import { useEffect, useState, useMemo } from 'react';
import { SetsTable } from './SetsTable.tsx';
import { SetFormModal } from '@components/SetModal/index.ts';

interface Props {
  children?: React.ReactNode;
  event?: FormEvent;
  i18n: Translations;
  onSubmit: (data: Event | FormEvent) => any | Promise<any>;
  styles?: { [key: string]: any };
  project: ProjectData;
  projectSlug: string;
  uuid: string;
}

const initialAvFile = {
  label: '',
  is_offline: 'false',
  file_url: '',
  duration: 0,
  caption_set: [],
};

export const NewEventForm: React.FC<Props> = (props) => {
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

const FormContents: React.FC<Props> = (props) => {
  const { children, i18n, styles } = props;
  // map URLs to durations (in seconds)
  const [durationVals, setDurationVals] = useState<{ [key: string]: number }>(
    {}
  );

  const [project, setProject] = useState(props.project);
  const [addSetOpen, setAddSetOpen] = useState(false);

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
        if (
          newDurationVals[vals.audiovisual_files[uuid].file_url] &&
          !vals.audiovisual_files[uuid].duration_overridden
        ) {
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

  const handleUpdateAVFile = (avUUID: string, avFile: AudiovisualFile) => {
    setFieldValue(
      `audiovisual_files.${avUUID}.caption_set`,
      avFile.caption_set
    );

    let p: ProjectData = JSON.parse(JSON.stringify(props.project));
    p.events[props.uuid].audiovisual_files[avUUID] = avFile;
    setProject(p);
  };

  const avFileOptions = useMemo(() => {
    const ret: { value: string; label: string }[] = [];
    if (values) {
      Object.keys((values as FormEvent).audiovisual_files).forEach((avKey) => {
        ret.push({
          value: avKey,
          // @ts-ignore
          label: (values as FormEvent).audiovisual_files[avKey].label,
        });
      });
    }

    return ret;
  }, [values]);

  const handleAddSet = () => {
    setAddSetOpen(true);
  };

  const handleCreateSet = async (
    newName: string,
    avFile: string,
    useForCaptions: boolean | undefined,
    speakerCategory: string | undefined
  ) => {
    if (props.event) {
      const res = await fetch(
        `/api/projects/${props.projectSlug}/events/${props.uuid}/annotations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: props.uuid,
            set: newName,
            source_id: avFile,
            caption_set: [],
          }),
        }
      ).then((res) => {
        setAddSetOpen(false);
        window.location.reload();
      });
    }
  };

  return (
    <Form className='event-form' style={styles}>
      {addSetOpen && (
        <SetFormModal
          i18n={props.i18n}
          title={t['Create Annotation Set']}
          onClose={() => setAddSetOpen(false)}
          onSave={handleCreateSet}
          avFileOptions={avFileOptions}
        />
      )}
      <div className='form-body'>
        <h2>{t['Event Information']}</h2>
        <TextInput label={t['Label']} name='label' required />
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
                      <div className='av-files-fields-line'>
                        <TextInput
                          className='av-label-input'
                          label={idx === 0 ? t['Label'] : undefined}
                          name={`audiovisual_files.${key}.label`}
                          required
                        />
                        <div className='av-url-group'>
                          <SelectInput
                            className='av-select-type'
                            width='100px'
                            backgroundColor='var(--gray-200)'
                            label={idx === 0 ? t['File'] : undefined}
                            name={`audiovisual_files.${key}.is_offline`}
                            required
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
                          <SelectInput
                            width='120px'
                            label={idx === 0 ? t['File Type'] : undefined}
                            name={`audiovisual_files.${key}.file_type`}
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
                            required={idx === 0 ? true : undefined}
                          />
                        </div>
                        <DurationInput
                          className='av-duration-input'
                          name={`audiovisual_files['${key}'].duration`}
                          // disable input if we were able to automatically set the duration
                          disabled={
                            !!durationVals[
                              (values as FormEvent).audiovisual_files[key]
                                .file_url
                            ] &&
                            !(values as FormEvent).audiovisual_files[key]
                              .duration_overridden
                          }
                          label={idx === 0 ? t['Duration'] : undefined}
                          // force this to re-render when the auto-duration thing picks up a value
                          key={
                            (values as FormEvent).audiovisual_files[key]
                              .duration_overridden
                              ? undefined
                              : durationVals[
                                  (values as FormEvent).audiovisual_files[key]
                                    .file_url
                                ]
                          }
                          required
                          initialValue={
                            (values as FormEvent).audiovisual_files[key]
                              .duration ||
                            durationVals[
                              (values as FormEvent).audiovisual_files[key]
                                .file_url
                            ]
                          }
                        />
                        <div className='av-duration-override'>
                          {!!durationVals[
                            (values as FormEvent).audiovisual_files[key]
                              .file_url
                          ] && (
                            <Button
                              className='outline av-duration-override-button'
                              onClick={() => {
                                setFieldValue(
                                  `audiovisual_files['${key}'].duration_overridden`,
                                  !(values as FormEvent).audiovisual_files[key]
                                    .duration_overridden
                                );
                                if (
                                  (values as FormEvent).audiovisual_files[key]
                                    .duration_overridden
                                ) {
                                  setFieldValue(
                                    `audiovisual_files['${key}'].duration`,
                                    durationVals[
                                      (values as FormEvent).audiovisual_files[
                                        key
                                      ].file_url
                                    ]
                                  );
                                }
                              }}
                              type='button'
                            >
                              {(values as FormEvent).audiovisual_files[key]
                                .duration_overridden
                                ? t['Calculate Duration']
                                : t['Override Duration']}
                            </Button>
                          )}
                        </div>
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
