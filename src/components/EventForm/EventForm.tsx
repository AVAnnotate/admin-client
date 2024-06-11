import { SelectInput, TextInput } from "@components/Formic/index.tsx";
import type { Event, Translations } from "@ty/Types.ts";
import { Form, Formik } from "formik";
import type React from "react";

interface Props {
  event: Event;
  title: string;
  i18n: Translations;
}

export const EventForm: React.FC<Props> = ({ event, title, i18n }) => {
  const { t } = i18n;

  return (
    <Formik
      initialValues={event || {}}
      onSubmit={() => { }}
    >
      <Form>
        <h2>{title}</h2>
        <TextInput
          label={t['Label']}
          name='label'
          required
        />
        <SelectInput
          label={t['Item Type']}
          name='type'
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
        {/* AV files go here */}
        {/* Separator goes here */}
        <h2>{t['Other']}</h2>
        <TextInput
          label={t['Description']}
          name='description'
          isLarge
        />
      </Form>
    </Formik>
  )
}
