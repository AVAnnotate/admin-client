import type { GitHubOrganization, Project, Translations } from '@ty/Types.ts';
import { Formik, Form } from 'formik';
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

  const generalRef = useRef(null);
  const userRef = useRef(null);
  const tagRef = useRef(null);

  const emptyProject: Project = {
    github_org: props.orgs[0].orgName,
    title: '',
    description: '',
    language: 'en',
    slug: '',
    creator: '',
    authors: '',
    media_player: 'avannotate',
    auto_populate_home_page: true,
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

  useEffect(() => {
    const executeScroll = (ref: React.MutableRefObject<HTMLElement | null>) =>
      ref.current!.scrollIntoView();

    if (props.selection === 'general') {
      executeScroll(generalRef);
    } else if (props.selection === 'users') {
      executeScroll(userRef);
    } else {
      executeScroll(tagRef);
    }
  }, [props.selection]);

  return (
    <div className='project-form'>
      <div className='project-form-container'>
        <Formik
          initialValues={props.project || emptyProject}
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
          {({ isSubmitting }) => (
            <Form>
              <h2>{t['General']}</h2>
              <div ref={generalRef} />
              <SelectInput
                label={t['GitHub Organization']}
                name='github_org'
                options={props.orgs.map((o) => ({
                  value: o.orgName,
                  label: o.orgName,
                }))}
                required
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

              <MediaPlayerField i18n={props.i18n} />

              <ToggleInput
                label={t['Auto-populate Home page']}
                helperText=''
                name='auto_populate_home_page'
              />

              <div className='project-form-divider' />
              <div ref={userRef} />
              <UserList
                label={t['Additional Users (optional)']}
                name='additional_users'
                addString={t['add']}
                nameString={t['User GitHub Name']}
                i18n={props.i18n}
              />

              <div className='project-form-divider' />

              <div ref={tagRef} />
              <h2>{t['Tags (optional)']}</h2>
              <div className='av-label'>{t['lorem']}</div>
              <SpreadsheetInput
                accept='.tsv, .csv, .xlsx, .txt'
                i18n={props.i18n}
                label={t['Tags File']}
                name='tags'
                importAsOptions={importAsOptions}
              />

              <BottomBar>
                <div className='project-form-actions-container'>
                  <Button className='primary' type='submit'>
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
          )}
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
