import {
  RichTextInput,
  SelectInput,
  TextInput,
} from '@components/Formic/index.tsx';
import type { FormPage, Page, ProjectData, Translations } from '@ty/Types.ts';
import { Form, Formik, useFormikContext } from 'formik';
import './PageForm.css';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { Button } from '@radix-ui/themes';
import { useMemo } from 'react';
import { initialPageValue } from '@lib/pages/index.ts';
import { InsertButton } from '@components/InsertEventButton/index.ts';

const defaultPage: FormPage = {
  content: initialPageValue,
  title: '',
  parent: undefined,
};

interface Props {
  i18n: Translations;
  page?: Page;
  uuid?: string;
  onSubmit: (page: FormPage) => Promise<any>;
  project: ProjectData;
}

const FormContents: React.FC<Props> = (props) => {
  const { t } = props.i18n;
  const { isSubmitting, values } = useFormikContext();

  const hasTitle = useMemo(() => !!(values as FormPage).title, [values]);

  const parentPageOptions = useMemo(
    () =>
      Object.keys(props.project.pages)
        .filter(
          (uuid) => uuid !== props.uuid && !props.project.pages[uuid].parent
        )
        .map((uuid) => {
          const page = props.project.pages[uuid];
          return {
            label: page.title,
            value: uuid,
          };
        }),
    [props.uuid, props.project.pages]
  );

  return (
    <Form className='page-form'>
      <div className='page-form-body'>
        <div className='top-config-bar'>
          <div>
            <TextInput label={t['Title']} name='title' required />
          </div>
          <div>
            <SelectInput
              label={t['Parent Page']}
              name='parent'
              options={parentPageOptions}
            />
          </div>
        </div>
        <RichTextInput
          className='page-content-editor'
          i18n={props.i18n}
          name='content'
          project={props.project}
        >
          <InsertButton i18n={props.i18n} project={props.project} />
        </RichTextInput>
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
            disabled={!hasTitle || isSubmitting}
            type='submit'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  );
};

export const PageForm: React.FC<Props> = (props) => {
  return (
    <Formik initialValues={props.page || defaultPage} onSubmit={props.onSubmit}>
      <FormContents {...props} />
    </Formik>
  );
};
