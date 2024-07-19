import type { Tags, Translations } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Formik, Form } from 'formik';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import { useMemo } from 'react';
import './ImportTagsDialog.css';

export interface ImportTagsDialogProps {
  i18n: Translations;

  onSave(tags: Tags): void;
}

export interface ImportTagsFormProps {
  i18n: Translations;

  onSave(data: any, headerMap: { [key: string]: number }): void;
}

const ImportTagsForm = (props: ImportTagsFormProps) => {
  const { t } = props.i18n;

  const importAsOptions = useMemo(
    () => [
      {
        label: t['Tag Name'],
        required: true,
        value: 'tag_name',
      },
      {
        label: t['Tag Category'],
        required: true,
        value: 'tag_category',
      },
    ],
    []
  );
  return (
    <Formik
      initialValues={{ tags: undefined }}
      validate={(values) => {
        const errors = {};
        // if (!values.email) {
        //   errors.email = 'Required';
        // } else if (
        //   !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        // ) {
        //   errors.email = 'Invalid email address';
        // }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        props.onSave(values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <SpreadsheetInput
            accept='.tsv, .csv, .xlsx, .txt'
            i18n={props.i18n}
            label={t['Tags File']}
            name='tags'
            importAsOptions={importAsOptions}
          />
        </Form>
      )}
    </Formik>
  );
};

export const ImportTagsDialog = (props: ImportTagsDialogProps) => {
  const { t } = props.i18n;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='dialog-button import-tags-dialog-button primary'>
          {t['Import File']}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Import Tag File']}
          </Dialog.Title>
          <ImportTagsForm i18n={props.i18n} onSave={props.onSave} />
          <Dialog.Close asChild>
            <button className='dialog-close-button' aria-label='Close'>
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
