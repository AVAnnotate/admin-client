import { MeatballMenu } from '@components/MeatballMenu/index.ts';
import { Box, Button } from '@radix-ui/themes';
import type { Event, Translations, FormEvent } from '@ty/Types.ts';
import type { DraggedPage } from '@ty/ui.ts';
import { useMemo } from 'react';
import { GripVertical, Trash } from 'react-bootstrap-icons';
import {
  SelectInput,
  TextInput,
  DurationInput,
} from '@components/Formic/index.tsx';
import { FieldArray } from 'formik';
import * as Separator from '@radix-ui/react-separator';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { v4 as uuidv4 } from 'uuid';
import { SetsTable } from '@components/EventForm/SetsTable.tsx';
import { useFormikContext } from 'formik';

interface Props {
  event: Event;
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

  const { setFieldValue, values } = useFormikContext();

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
      className={`page-list-box ${
        props.pickedUp?.hoverIndex === props.index
          ? 'page-list-box-hovered'
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
      <MeatballMenu
        buttons={
          page.autogenerate.enabled ? meatballOptionsAutoGen : meatballOptions
        }
        row={page}
      />
    </Box>
  );
};
