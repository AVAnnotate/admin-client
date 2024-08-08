import * as Dialog from '@radix-ui/react-dialog';
import { Formik, useFormikContext } from 'formik';
import { generateDefaultAnnotation } from '@lib/events/index.ts';
import type { AnnotationEntry, ProjectData, Translations } from '@ty/Types.ts';
import {
  RichTextInput,
  SelectInput,
  TimeInput,
} from '@components/Formic/index.tsx';
import { Button } from '@radix-ui/themes';
import './AnnotationModal.css';
import { TagSelect } from './TagSelect.tsx';
import { useState } from 'react';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';

interface Props {
  annotation?: AnnotationEntry;
  i18n: Translations;
  onClose: () => void;
  onSubmit: (anno: AnnotationEntry) => any;
  project: ProjectData;
  title: string;
}

export const AnnotationModal: React.FC<Props> = (props) => (
  <Formik
    initialValues={props.annotation || generateDefaultAnnotation()}
    onSubmit={props.onSubmit}
  >
    <AnnotationModalContents {...props} />
  </Formik>
);

export const AnnotationModalContents: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);

  const { setFieldValue, values } = useFormikContext();

  const { t } = props.i18n;

  return (
    <>
      <Dialog.Root open>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <Dialog.Content className='dialog-content annotation-modal'>
            {loading && <LoadingOverlay />}
            <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>
            <div className='annotation-modal-body'>
              <div className='time-inputs'>
                <TimeInput
                  initialValue={props.annotation?.start_time || 0}
                  label={t['Start Time']}
                  onChange={(time) => setFieldValue('start_time', time)}
                  required
                />
                <TimeInput
                  initialValue={props.annotation?.end_time || 0}
                  label={t['End Time']}
                  onChange={(time) => setFieldValue('end_time', time)}
                  required
                />
              </div>
              <RichTextInput
                i18n={props.i18n}
                name='annotation'
                elementTypes={['blocks', 'marks']}
              />
              {/* <SelectInput
              label={t['Annotation Set']}
              // todo: I think we're using some sort of tag-based system for sets,
              //       not a separate field.
              name='annotation_set'
              options={[]}
            /> */}
              <div>
                <div className='av-label-bold formic-form-label'>
                  {t['Tags']}
                </div>
                <TagSelect
                  i18n={props.i18n}
                  project={props.project}
                  tags={props.project.project.tags}
                />
              </div>
            </div>
            <div className='annotation-modal-close-bar'>
              <Dialog.Close asChild>
                <Button
                  className='unstyled'
                  aria-label='Close'
                  onClick={props.onClose}
                >
                  {t['cancel']}
                </Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button
                  className='primary'
                  aria-label='Close'
                  onClick={() => {
                    setLoading(true);
                    props.onSubmit(values as AnnotationEntry);
                  }}
                >
                  {t['save']}
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
