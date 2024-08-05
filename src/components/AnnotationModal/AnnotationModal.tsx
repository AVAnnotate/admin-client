import * as Dialog from '@radix-ui/react-dialog';
import { Formik, useFormikContext } from 'formik';
import { generateDefaultAnnotation } from '@lib/events/index.ts';
import type { AnnotationEntry, Translations } from '@ty/Types.ts';
import './AnnotationModal.css';
import { TextInput, TimeInput } from '@components/Formic/index.tsx';

interface Props {
  annotation?: AnnotationEntry;
  i18n: Translations;
  onSubmit: (anno: AnnotationEntry) => any;
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
  const { setFieldValue } = useFormikContext();

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>
          <TimeInput
            initialValue={props.annotation?.start_time || 0}
            label={t['Start time']}
            onChange={(time) => setFieldValue('start_time', time)}
            required
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
