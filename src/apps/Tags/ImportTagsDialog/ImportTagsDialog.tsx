import type { Tags, Translations } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Formik, Form, useFormikContext } from 'formik';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import { useContext, useMemo, useState } from 'react';
import './ImportTagsDialog.css';
import {
  SpreadsheetInputContext,
  SpreadsheetInputContextComponent,
} from '@components/Formic/SpreadsheetInput/SpreadsheetInputContext.tsx';
import type { any } from 'astro/zod';
import { Button } from '@radix-ui/themes';

export interface ImportTagsDialogProps {
  i18n: Translations;

  onSave(data: any[], headerMap: { [key: string]: number }): void;
}

export interface ImportTagsFormProps {
  i18n: Translations;

  onSave(data: any[], headerMap: { [key: string]: number }): void;
}

const ImportTagsForm = (props: ImportTagsFormProps) => {
  const { t } = props.i18n;

  const { headerMap } = useContext(SpreadsheetInputContext);

  const [isValid, setIsValid] = useState(false);

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
      initialValues={[]}
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
        props.onSave(values, headerMap);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, values }) => (
        <Form>
          <div className='import-tags-dialog-import'>
            <SpreadsheetInput
              accept='.tsv, .csv, .xlsx, .txt'
              i18n={props.i18n}
              label={t['Tags File']}
              name='tags'
              importAsOptions={importAsOptions}
              isValid={setIsValid}
            />
          </div>
          <div className='import-tags-dialog-save '>
            <button type='submit' className='primary' disabled={!isValid}>
              {t['Save']}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export const ImportTagsDialog = (props: ImportTagsDialogProps) => {
  const { t } = props.i18n;

  const [open, setOpen] = useState(false);

  const handleSave = (data: any, headerMap: { [key: string]: number }) => {
    props.onSave(data.tags.data, headerMap);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button className='primary'>{t['Import File']}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content import-tags-dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Import Tag File']}
          </Dialog.Title>
          <SpreadsheetInputContextComponent>
            <ImportTagsForm i18n={props.i18n} onSave={handleSave} />
          </SpreadsheetInputContextComponent>
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
