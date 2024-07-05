import {
  SelectInput,
  TextInput,
  TimeInput,
} from '@components/Formic/index.tsx';
import type { Event, FormEvent, Translations } from '@ty/Types.ts';
import { FieldArray, Form, Formik, useFormikContext } from 'formik';
import * as Separator from '@radix-ui/react-separator';
import type React from 'react';
import { Button } from '@radix-ui/themes';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import './EventForm.css';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { RichTextInput } from '@components/Formic/index.tsx';
import { generateDefaultEvent } from '@lib/events/index.ts';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  children?: React.ReactNode;
  event?: FormEvent;
  i18n: Translations;
  onSubmit: (data: Event | FormEvent) => any;
  styles?: { [key: string]: any };
}

const initialAvFile = {
  label: '',
  file_url: '',
  duration: 0,
};

export const EventForm: React.FC<Props> = (props) => (
  <Formik
    initialValues={props.event || generateDefaultEvent()}
    onSubmit={props.onSubmit}
  >
    <FormContents {...props} />
  </Formik>
);

const FormContents: React.FC<Props> = ({ children, i18n, styles }) => {
  const { t } = i18n;

  const { setFieldValue, values, isSubmitting } = useFormikContext();

  return (
    <Form className='event-form' style={styles}>
      <div className='form-body'>
        <h2>{t['Event Information']}</h2>
        <TextInput label={t['Label']} name='label' required />
        <SelectInput
          label={t['Item Type']}
          name='item_type'
          options={[
            {
              label: t['Audio'],
              value: 'Audio',
            },
            {
              label: t['Video'],
              value: 'Video',
            },
          ]}
          required
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <h2>{t['Audiovisual File(s)']}</h2>
        <FieldArray
          name='audiovisual_files'
          render={() => (
            <div className='av-files-list'>
              {Object.keys((values as FormEvent).audiovisual_files).map(
                (key, idx) => (
                  <div key={key} className='av-files-fields'>
                    <TextInput
                      className='av-label-input'
                      label={idx === 0 ? t['Label'] : undefined}
                      name={`audiovisual_files.${key}.label`}
                    />
                    <TextInput
                      className='av-file-url-input'
                      label={idx === 0 ? t['File URL'] : undefined}
                      name={`audiovisual_files.${key}.file_url`}
                    />
                    <TimeInput
                      className='av-duration-input'
                      label={idx === 0 ? t['Duration'] : undefined}
                      onChange={(input: number) =>
                        setFieldValue(
                          `audiovisual_files.${key}.duration`,
                          input
                        )
                      }
                      defaultValue={
                        (values as FormEvent).audiovisual_files[key].duration
                      }
                    />
                    {idx !== 0 ? (
                      <Button
                        className='av-trash-button'
                        onClick={() => {
                          setFieldValue(`audiovisual_files.${key}`, undefined);
                        }}
                        type='button'
                        variant='ghost'
                      >
                        <TrashIcon />
                      </Button>
                    ) : (
                      // show an empty div so the spacing stays consistent
                      <div className='av-trash-button'></div>
                    )}
                  </div>
                )
              )}
              <Button
                className='primary add-av-button'
                onClick={() =>
                  setFieldValue(`audiovisual_files.${uuidv4()}`, initialAvFile)
                }
                type='button'
              >
                <PlusIcon color='white' />
                {t['Add']}
              </Button>
            </div>
          )}
        />
        <Separator.Root className='SeparatorRoot' decorative />
        <h2>{t['Other']}</h2>
        <RichTextInput
          label={t['Description (Optional)']}
          helperText={t['A brief paragraph describing your event.']}
          name='description'
          i18n={i18n}
          initialValue={(values as FormEvent).description}
          onChange={(data) => setFieldValue('description', data)}
        />
        <TextInput label={t['Citation (Optional)']} name='citation' />
        {children}
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
