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
import { Button, Select, TextField } from '@radix-ui/themes';
import { PlusIcon, TrashIcon, Pencil2Icon } from '@radix-ui/react-icons';
import './EventForm.css';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { RichTextInput } from '@components/Formic/index.tsx';
import { generateDefaultEvent, getFileDuration } from '@lib/events/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState, useMemo } from 'react';
import { SetsTable } from './SetsTable.tsx';
import { SetFormModal } from '@components/SetModal/index.ts';
import { AVFileList } from '@components/AVFileList/AVFileList.tsx';
import { DragTable } from '@components/DragTable/DragTable.tsx';
import { BoxArrowUpRight, Trash, FiletypeHtml } from 'react-bootstrap-icons';
import { MeatballMenu } from '@components/MeatballMenu/MeatballMenu.tsx';

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

export const EditEventForm: React.FC<Props> = (props) => {
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

  const meatballOptions = useMemo(() => {
    return [
      {
        label: t['Override Duration'],
        icon: BoxArrowUpRight,
        onClick: () => {},
      },
      {
        label: t['Delete'],
        icon: TrashIcon,
        onClick: () => {},
      },
    ];
  }, [props.event, values]);

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

  const handleDrop = () => {};

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
        <div className='title-row'>
          <h2>{t['Audiovisual File(s)']}</h2>
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
        <FieldArray
          name='audiovisual_files'
          render={() => (
            <div className='av-files-list'>
              <DragTable
                entries={[
                  {
                    label: t['File Type'],
                    widthPct: 8,
                  },
                  {
                    label: t['Label'],
                    widthPct: 20,
                  },
                  {
                    label: t['File'],
                    widthPct: 9,
                  },
                  {
                    label: '',
                    widthPct: 47,
                  },
                  {
                    label: t['Duration'],
                    widthPct: 7,
                  },
                  {
                    label: '',
                    widthPct: 3,
                  },
                ]}
                rows={
                  props.event
                    ? Object.keys(props.event.audiovisual_files).map((uuid) => {
                        const avFile = (values as any)['audiovisual_files'][
                          uuid
                        ];
                        return {
                          id: uuid,
                          component: (
                            <>
                              <Select.Root
                                onValueChange={(value) =>
                                  setFieldValue(
                                    `audiovisual_files.${uuid}.file_type`,
                                    value
                                  )
                                }
                                value={
                                  (values as any)[
                                    `audiovisual_files[${uuid}]['file_type']`
                                  ] || (values as any)['item_type']
                                }
                              >
                                <Select.Trigger className='av-type' />
                                <Select.Content>
                                  <Select.Item value='Audio'>
                                    {t['Audio']}
                                  </Select.Item>
                                  <Select.Item value='Video'>
                                    {t['Video']}
                                  </Select.Item>
                                </Select.Content>
                              </Select.Root>
                              <TextField.Root
                                className='av-file-label'
                                onChange={(ev) =>
                                  setFieldValue(
                                    `audiovisual_files.${uuid}.label`,
                                    ev.target.value
                                  )
                                }
                                value={avFile.label}
                              />
                              <Select.Root
                                onValueChange={(value) =>
                                  setFieldValue(
                                    `audiovisual_files.${uuid}.is_offline`,
                                    value
                                  )
                                }
                                value={avFile.is_offline ? 'true' : 'false'}
                              >
                                <Select.Trigger className='av-file-type' />
                                <Select.Content>
                                  <Select.Item value='false'>
                                    {t['URL']}
                                  </Select.Item>
                                  <Select.Item value='true'>
                                    {t['Offline']}
                                  </Select.Item>
                                </Select.Content>
                              </Select.Root>
                              <TextField.Root
                                className='av-file-url'
                                onChange={(ev) =>
                                  setFieldValue(
                                    `audiovisual_files.${uuid}.file_url`,
                                    ev.target.value
                                  )
                                }
                                disabled={
                                  avFile.is_offline === 'true' ? true : false
                                }
                                value={avFile.file_url}
                              />
                              <TextField.Root
                                onChange={(ev) =>
                                  setFieldValue(
                                    `audiovisual_files.${uuid}.duration`,
                                    ev.target.value
                                  )
                                }
                                value={avFile.duration}
                              />
                              <MeatballMenu
                                buttons={meatballOptions}
                                row={avFile}
                              />
                            </>
                          ),
                        };
                      })
                    : []
                }
                onDrop={handleDrop}
              />

              <Separator.Root className='SeparatorRoot' decorative />
              <div className='sets-table'>
                <h2>{t['Annotation Sets']}</h2>
                <SetsTable
                  project={project}
                  i18n={i18n}
                  projectSlug={props.projectSlug}
                  eventId={props.uuid}
                  onUpdateAVFile={handleUpdateAVFile}
                />
                <Button
                  className='primary add-av-button'
                  onClick={handleAddSet}
                  type='button'
                  disabled={!props.event}
                >
                  <PlusIcon color='white' />
                  {t['Add']}
                </Button>
              </div>
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
