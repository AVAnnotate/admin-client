import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Box, Button } from '@radix-ui/themes';
import type { Translations, FormEvent } from '@ty/Types.ts';
import type { DraggedPage } from '@ty/ui.ts';
import { useMemo } from 'react';
import { GripVertical, Trash } from 'react-bootstrap-icons';
import {
  SelectInput,
  TextInput,
  DurationInput,
} from '@components/Formic/index.tsx';
import { FieldArray } from 'formik';
import { TrashIcon } from '@radix-ui/react-icons';
import { useFormikContext } from 'formik';
import { useState, useEffect } from 'react';
import { getFileDuration } from '@lib/events/index.ts';

interface Props {
  event: FormEvent;
  uuid: string;
  index: number;
  pickedUp: DraggedPage | null;
  setPickedUp: (arg: DraggedPage | null) => void;
  i18n: Translations;
  onDrop: () => Promise<void>;
  onDelete(): void;
}

export const AVFileRow: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  const [durationVals, setDurationVals] = useState<{ [key: string]: number }>(
    {}
  );

  const { setFieldValue, values } = useFormikContext();

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

  const meatballOptions = useMemo(() => {
    return [
      {
        label: t['Delete'],
        icon: Trash,
        // @ts-ignore
        onClick: async () => props.onDelete(),
      },
    ];
  }, [props.event]);

  return (
    <Box
      className={`av-file-list-box ${
        props.pickedUp?.hoverIndex === props.index
          ? 'av-file-list-box-hovered'
          : ''
      }`}
      draggable
      key={props.uuid}
      onDragStart={(_ev) => {
        props.setPickedUp({
          uuid: props.uuid,
          originalIndex: props.index,
          hoverIndex: props.index,
        });
      }}
      onDragOver={(ev) => {
        ev.preventDefault();
        if (props.pickedUp) {
          props.setPickedUp({
            ...props.pickedUp,
            hoverIndex: props.index,
          });
        }
      }}
      onDrop={async () => await props.onDrop()}
      onDragEnd={() => props.setPickedUp(null)}
      height='56px'
      width='100%'
    >
      <GripVertical />
      <FieldArray
        name='audiovisual_files'
        render={() => (
          <div className='av-files-list'>
            {Object.keys((values as FormEvent).audiovisual_files).map(
              (key, idx) => {
                return (
                  <div className='av-files-fields-line' key={idx}>
                    <TextInput
                      className='av-label-input'
                      name={`audiovisual_files.${key}.label`}
                      required
                    />
                    <SelectInput
                      className='av-select-type'
                      width='100px'
                      backgroundColor='var(--gray-200)'
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
                    <DurationInput
                      className='av-duration-input'
                      name={`audiovisual_files['${key}'].duration`}
                      // disable input if we were able to automatically set the duration
                      disabled={
                        !!durationVals[
                          (values as FormEvent).audiovisual_files[key].file_url
                        ] &&
                        !(values as FormEvent).audiovisual_files[key]
                          .duration_overridden
                      }
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
                        (values as FormEvent).audiovisual_files[key].duration ||
                        durationVals[
                          (values as FormEvent).audiovisual_files[key].file_url
                        ]
                      }
                    />
                    <div className='av-duration-override'>
                      {!!durationVals[
                        (values as FormEvent).audiovisual_files[key].file_url
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
                                  (values as FormEvent).audiovisual_files[key]
                                    .file_url
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
                          setFieldValue(`audiovisual_files.${key}`, undefined);
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
          </div>
        )}
      />
      <MeatballMenu buttons={meatballOptions} row={props.event} />
    </Box>
  );
};
