import { TextInput, ToggleInput } from '@components/Formic/index.tsx';
import { SlateInput } from '@components/Formic/SlateInput/SlateInput.tsx';
import type { Event, Translations } from '@ty/Types.ts';
import { Form, Formik, useField, useFormikContext } from 'formik';
import type React from 'react';
import { Button } from '@radix-ui/themes';
import './ImportForm.css';
import { BottomBar } from '@components/BottomBar/index.ts';

interface Props {
  i18n: Translations;
  styles?: { [key: string]: any };
  onSubmit: (data: any) => any;
  manifestURL: string;
  events: Event[];
}

export const ImportForm: React.FC<Props> = (props) => {
  const initialValues = {
    manifest_url: props.manifestURL,
    description: null,
    auto_generate_web_page: true,
  };
  return (
    <Formik initialValues={initialValues} onSubmit={props.onSubmit}>
      <FormContents {...props} />
    </Formik>
  );
};

type DescriptionInputProps = {
  i18n: Translations;
};
const DescriptionInput = (props: DescriptionInputProps) => {
  const [field, meta, helpers] = useField('description');
  const { value } = meta;
  const { setValue } = helpers;

  const handleChange = (data: any) => {
    setValue(data);
  };

  return <SlateInput onChange={handleChange} i18n={props.i18n} />;
};

const FormContents: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  const { isSubmitting } = useFormikContext();

  return (
    <Form className='import-form' style={props.styles}>
      <div className='form-body'>
        <div className='import-form-divider' />
        {props.events.length === 1 ? (
          <>
            <div className='av-label-bold'>{t['Description (Optional)']}</div>
            <div className='av-label import-form-description'>
              {t['A brief paragraph describing your event.']}
            </div>
            <DescriptionInput i18n={props.i18n} />
            <ToggleInput
              helperText={t['lorem']}
              label={t['Auto-generate web page for these events?']}
              name='auto_generate_web_page'
            />
          </>
        ) : (
          <div />
        )}
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
            disabled={isSubmitting}
            type='submit'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  );
};
