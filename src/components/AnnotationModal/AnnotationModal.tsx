import * as Dialog from '@radix-ui/react-dialog';
import { Formik } from 'formik';
import { generateDefaultAnnotation } from '@lib/events/index.ts';
import type { AnnotationEntry } from '@ty/Types.ts';
import './AnnotationModal.css';

interface Props {
  annotation?: AnnotationEntry;
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
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{props.title}</Dialog.Title>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
