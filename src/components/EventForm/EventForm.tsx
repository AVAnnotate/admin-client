import { SelectInput, TextInput, TimeInput } from "@components/Formic/index.tsx";
import type { Event, Translations } from "@ty/Types.ts";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { Separator } from "@radix-ui/react-separator";
import type React from "react";
import { Button } from "@radix-ui/themes";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import './EventForm.css'
import { BottomBar } from "@components/BottomBar/BottomBar.tsx";

interface Props {
  event?: Event;
  title: string;
  i18n: Translations;
  onSubmit: (data: Event) => any;
}

const initialAvFile = {
  label: '',
  file_url: '',
  duration: 0
}

// We don't need to init every field this way,
// we just need to make sure there's an AV form
// ready to go on first load.
const initialValues = {
  audiovisual_files: [
    initialAvFile
  ],
  item_type: 'Audio'
}

export const EventForm: React.FC<Props> = (props) => (
  <Formik
    initialValues={props.event || initialValues}
    onSubmit={() => { }}
  >
    <FormContents {...props} />
  </Formik>
)

export const FormContents: React.FC<Props> = ({ i18n, onSubmit, title }) => {
  const { t } = i18n;

  const { setValues, values, isSubmitting } = useFormikContext();

  return (
    <Form className="event-form">
      <div className="form-body">
        <h1>{title}</h1>
        <h2>{t['Event Information']}</h2>
        <TextInput
          label={t['Label']}
          name='label'
          required
        />
        <SelectInput
          label={t['Item Type']}
          name='item_type'
          options={[
            {
              label: t['Audio'],
              value: 'Audio'
            },
            {
              label: t['Video'],
              value: 'Video'
            }
          ]}
          required
        />
        <h2>{t['Audiovisual File(s)']}</h2>
        <FieldArray
          name='audiovisual_files'
          render={(arrayHelpers) => (
            <div className="av-files-list">
              {(values as Event).audiovisual_files.map((_av, idx) => (
                <div key={idx} className="av-files-fields">
                  <TextInput
                    className="av-label-input"
                    label={idx === 0 ? t['Label'] : undefined}
                    name={`audiovisual_files.${idx}.label`}
                  />
                  <TextInput
                    className="av-file-url-input"
                    label={idx === 0 ? t['File URL'] : undefined}
                    name={`audiovisual_files.${idx}.file_url`}
                  />
                  <TimeInput
                    className="av-duration-input"
                    label={idx === 0 ? t['Duration'] : undefined}
                    onChange={(input: number) => {
                      const newValues = structuredClone(values) as Event
                      newValues.audiovisual_files[idx].duration = input
                      setValues(newValues)
                    }}
                    defaultValue={(values as Event).audiovisual_files[idx].duration}
                  />
                  {idx !== 0
                    ? (
                      <Button
                        className="av-trash-button"
                        onClick={() => arrayHelpers.remove(idx)}
                        variant='ghost'
                      >
                        <TrashIcon />
                      </Button>
                      // show an empty div so the spacing stays consistent
                    ) : <div className="av-trash-button"></div>}
                </div>
              ))}
              <Button
                className="primary add-av-button"
                onClick={() => arrayHelpers.push(initialAvFile)}
                type='button'
              >
                <PlusIcon color="white" />
                {t['Add']}
              </Button>
            </div>
          )}
        />
        <Separator />
        <h2>{t['Other']}</h2>
        <TextInput
          label={t['Description (Optional)']}
          name='description'
          isLarge
        />
        <TextInput
          label={t['Citation (Optional)']}
          name='citation'
        />
      </div>
      <BottomBar>
        <div className="bottom-bar-flex">
          <Button
            className="cancel-button outline"
            onClick={() => history.back()}
            type='button'
            variant='outline'
          >
            {t['cancel']}
          </Button>
          <Button
            className="save-button primary"
            disabled={isSubmitting}
            onClick={() => onSubmit(values as Event)}
            type='button'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  )
}