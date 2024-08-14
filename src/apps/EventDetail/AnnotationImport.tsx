import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@radix-ui/themes';
import type { AnnotationEntry, Translations } from '@ty/Types.ts';
import { Formik } from 'formik';
import { useMemo, useState } from 'react';

interface Props {
  i18n: Translations;
  onClose: () => void;
  onSubmit: (arg: { annotations: AnnotationEntry[] }) => any;
}

const initialValues = { annotations: [] };

export const AnnotationImport: React.FC<Props> = (props) => {
  return (
    <Formik initialValues={initialValues} onSubmit={props.onSubmit}>
      <AnnotationImportModal {...props} />
    </Formik>
  );
};

export const AnnotationImportModal: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);

  const { t } = props.i18n;

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

  return (
    <Dialog.Root>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          {loading && <LoadingOverlay />}
          <Dialog.Title>{t['Import Annotations']}</Dialog.Title>
          <div>
            <SpreadsheetInput
              i18n={props.i18n}
              importAsOptions={importAsOptions}
              name='annotations'
            />
          </div>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
              aria-label='Close'
              onClick={props.onClose}
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
