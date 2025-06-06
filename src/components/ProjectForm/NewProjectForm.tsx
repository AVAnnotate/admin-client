import type { GitHubOrganization, Project, Translations } from '@ty/Types.ts';
import { Formik, Form, useFormikContext } from 'formik';
import {
  TextInput,
  SelectInput,
  ToggleInput,
  UserList,
} from '@components/Formic/index.tsx';
import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import countryOptions from '@lib/language-codes.ts';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { Button } from '@radix-ui/themes';
import { useEffect, useRef, useMemo, useContext } from 'react';

import './ProjectForm.css';
import {
  SpreadsheetInputContextComponent,
  SpreadsheetInputContext,
} from '@components/Formic/SpreadsheetInput/SpreadsheetInputContext.tsx';
import { MediaPlayerField } from './Fields.tsx';
import { avaError } from 'src/nanos/error.ts';

export interface NewProjectFormProps {
  project?: Project;

  orgs: GitHubOrganization[];

  i18n: Translations;

  selection: string;

  onSave(project: Project, importOptions: { [key: string]: number }): void;
}

const FormContents = (props: NewProjectFormProps) => {
  const { t } = props.i18n;

  const { headerMap } = useContext(SpreadsheetInputContext);

  const emptyProject: Project = {
    github_org: props.orgs[0].orgName,
    is_private: false,
    generate_pages_site: true,
    title: '',
    description: '',
    language: 'en',
    slug: '',
    creator: '',
    authors: '',
    media_player: 'avannotate',
    auto_populate_home_page: false,
    additional_users: [],
    tags: {
      tagGroups: [],
      tags: [],
    },
    created_at: new Date().toDateString(),
    updated_at: '',
  };

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
    <div className='project-form'>
      <div className='project-form-container'>
        <Formik
          initialValues={props.project || emptyProject}
          validate={(values) => {
            avaError.set('');
            const errors: any = {};
            if (!/^[a-zA-Z0-9-]+$/i.test(values.slug)) {
              errors.slug =
                t[
                  'Project Slug should only contain alphanumeric characters and hyphens.'
                ];
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            props.onSave(values, headerMap);
            setSubmitting(false);
          }}
        >
          {({ isValid, setFieldValue, values }) => {
            if (
              (values as Project).is_private &&
              (values as Project).generate_pages_site
            ) {
              setFieldValue('generate_pages_site', false);
            }

            return (
              <Form>
                <h2>{t['General']}</h2>
                <SelectInput
                  label={t['GitHub Organization']}
                  name='github_org'
                  options={props.orgs.map((o) => ({
                    value: o.orgName,
                    label: o.orgName,
                  }))}
                  required
                />

                <ToggleInput
                  label={t['Use Private Repository']}
                  name='is_private'
                  helperText={t['_private_repository_helper_text_']}
                />

                <TextInput
                  label={t['Title']}
                  helperText={
                    t[
                      'A title that will show up at the top of your project pages.'
                    ]
                  }
                  name='title'
                  required
                />

                <TextInput
                  label={t['Description']}
                  helperText={t['A brief paragraph describing your project.']}
                  name='description'
                  isLarge
                  required
                />

                <SelectInput
                  label={t['Language']}
                  name='language'
                  options={countryOptions}
                  required
                />

                <TextInput
                  label={t['Project Slug']}
                  helperText={
                    t[
                      'A short name used in URLs for your project which will be the repository name used on GitHub.'
                    ]
                  }
                  name='slug'
                  required
                  bottomNote={
                    t[
                      'Please do not use spaces or punctuation other than hyphens.'
                    ]
                  }
                />

                <TextInput
                  label={t['Project Author(s)']}
                  helperText={
                    t[
                      'Names will appear at the bottom of your project pages. If left blank, the project owners GitHub username will show instead.'
                    ]
                  }
                  name='authors'
                />

                <div className='project-form-divider' />
                <h2>{t['Collaborators']}</h2>
                <UserList
                  label={
                    t[
                      'Adding additional GitHub users will give them access to edit most aspects of a project.'
                    ]
                  }
                  name='additional_users'
                  addString={t['Add Collaborator']}
                  nameString={t['User GitHub Name']}
                  i18n={props.i18n}
                />

                <BottomBar>
                  <div className='project-form-actions-container'>
                    <Button
                      className='primary'
                      type='submit'
                      disabled={!isValid}
                    >
                      {t['Create Project']}
                    </Button>
                    <a href={`/${props.i18n.lang}/projects`}>
                      <Button type='submit' className='outline'>
                        {t['cancel']}
                      </Button>
                    </a>
                  </div>
                </BottomBar>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export const NewProjectForm: React.FC<NewProjectFormProps> = (props) => {
  return (
    <SpreadsheetInputContextComponent>
      <FormContents {...props} />
    </SpreadsheetInputContextComponent>
  );
};
