import { ToggleInput } from '@components/Formic/index.tsx';
import { SlateInput } from '@components/Formic/SlateInput/SlateInput.tsx';
import type { Event, Translations } from '@ty/Types.ts';
import { Form, Formik, useField, useFormikContext } from 'formik';
import type React from 'react';
import { Button, Checkbox } from '@radix-ui/themes';
import { BottomBar } from '@components/BottomBar/index.ts';
import { Node } from 'slate';
import './ImportForm.css';

interface Props {
  i18n: Translations;
  styles?: { [key: string]: any };
  onSubmit: (data: any) => any;
  manifestURL: string;
  events: { id: string; event: Event }[];
}

export const ImportForm: React.FC<Props> = (props) => {
  const initialValues = {
    manifest_url: props.manifestURL,
    description: null,
    auto_generate_web_page: true,
    event_labels: [],
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

  return (
    <SlateInput
      onChange={handleChange}
      i18n={props.i18n}
      elementTypes={['blocks', 'marks']}
    />
  );
};

type EventSelectProps = {
  i18n: Translations;

  events: { id: string; event: Event }[];
};
const EventSelect = (props: EventSelectProps) => {
  const [field, meta, helpers] = useField('event_labels');
  const { value } = meta;
  const { setValue } = helpers;

  const { t } = props.i18n;

  const handleChange = (label: string, checked: boolean) => {
    if (label === 'all') {
      checked ? setValue(props.events.map((e) => e.event.label)) : setValue([]);
    } else {
      checked
        ? setValue([...value, label])
        : setValue(value.filter((v: string) => v !== label));
    }
  };

  return (
    <>
      <div className='import-form-event-header'>
        <div className='av-label-bold'>{t['Events']}</div>
        <div className='import-form-required' />
      </div>
      <div className='av-label'>
        {t['Select which canvas or canvases you would like to add as events.']}
      </div>
      <div className='import-form-event-list'>
        <div className='import-form-event-row'>
          <Checkbox
            checked={value.length === props.events.length}
            onCheckedChange={(checked) =>
              handleChange('all', checked as boolean)
            }
          />
          <div className='av-label'>{['Select All']}</div>
        </div>
        <div className='import-form-event-list-divider' />
        {props.events.map((e) => (
          <div className='import-form-event-row' key={e.event.label}>
            <Checkbox
              checked={value.includes(e.event.label)}
              onCheckedChange={(checked) =>
                handleChange(e.event.label, checked as boolean)
              }
            />
            <div className='av-label'>{e.event.label}</div>
          </div>
        ))}
      </div>
    </>
  );
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
          <>
            <EventSelect i18n={props.i18n} events={props.events} />
          </>
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
