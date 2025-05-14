import type { Translations } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Formik, Form } from 'formik';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import { useContext, useMemo, useState } from 'react';
import './ImportTagsDialog.css';
import {
  SpreadsheetInputContext,
  SpreadsheetInputContextComponent,
} from '@components/Formic/SpreadsheetInput/SpreadsheetInputContext.tsx';
import { Button } from '@radix-ui/themes';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';

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
      validate={(_values) => {
        const errors = {};
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        props.onSave(values, headerMap);
        setSubmitting(false);
      }}
    >
      {() => (
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
      <Dialog.Trigger asChild>
        <Button className='primary import-tags-dialog-button' type='button'>
          <FileEarmarkArrowUp />
          {t['Import']}
        </Button>
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
