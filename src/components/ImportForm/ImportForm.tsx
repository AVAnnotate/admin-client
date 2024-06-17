import { TextInput, ToggleInput } from "@components/Formic/index.tsx"
import type { Translations } from "@ty/Types.ts"
import { Form, Formik, useFormikContext } from "formik"
import type React from "react"
import { Button } from "@radix-ui/themes";
import './ImportForm.css'
import { BottomBar } from "@components/BottomBar/index.ts"

interface Props {
  i18n: Translations;
  styles: { [key: string]: any };
  onSubmit: (data: any) => any;
}

const initialValues = {
  manifest_url: null,
  description: null,
  auto_generate_web_page: true
}

export const ImportForm: React.FC<Props> = (props) => (
  <Formik
    initialValues={initialValues}
    onSubmit={props.onSubmit}
  >
    <FormContents {...props} />
  </Formik>
)

const FormContents: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  const { isSubmitting } = useFormikContext();

  return (
    <Form className="import-form" style={props.styles}>
      <div className="form-body">
        <TextInput
          className="av-manifest-url-input"
          label={t['IIIF Manifest URL']}
          name='manifest_url'
        />
        <TextInput
          label={t['Description (Optional)']}
          helperText={t['A brief paragraph describing your event.']}
          name='description'
          isLarge
        />
        <ToggleInput
          helperText={t['lorem']}
          label={t['Auto-generate web page for this event?']}
          name='auto_generate_web_page'
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
            type='submit'
          >
            {t['save']}
          </Button>
        </div>
      </BottomBar>
    </Form>
  )
}
