import type { GitHubOrganization, Project, Translations } from '@ty/Types.ts';
import { Formik, Form } from 'formik';
import {
  TextInput,
  SelectInput,
  SwitchInput,
  ToggleInput,
  UserList,
} from '@components/Formic/index.tsx';
import countryOptions from '@lib/language-codes.js';
import type { Tags, ProviderUser } from '@ty/Types.ts';
import { BottomBar } from '@components/BottomBar/BottomBar.tsx';
import { Button } from '@radix-ui/themes';
import { useState } from 'react';

import './ProjectForm.css';

export interface ProjectFormProps {
  project?: Project;

  allUsers: ProviderUser[];

  orgs: GitHubOrganization[];

  i18n: Translations;

  onSave(project: Project): void;
}

export const ProjectForm = (props: ProjectFormProps) => {
  const { t } = props.i18n;

  const [searchOpen, setSearchOpen] = useState(false);

  const emptyProject: Project = {
    gitHubOrg: '',
    title: '',
    description: '',
    language: 'en',
    slug: '',
    creator: '',
    authors: '',
    mediaPlayer: 'universal',
    autoPopulateHomePage: true,
    additionalUsers: [],
    tags: {
      tagGroups: [],
      tags: [],
    },
    createdAt: new Date().toDateString(),
    updatedAt: '',
  };

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
            props.onSave(values);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <h2>{t['General']}</h2>

              <SelectInput
                label={t['GitHub Organization']}
                name='gitHubOrg'
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

              <SwitchInput
                label={t['Media Player']}
                helperText={
                  t[
                    'Your project can be presented using either the Universal Viewer or the Aviary Player to present media. Annotation-centered projects like digital editions generally work better with Universal Viewer, while media-centered projects like exhibitions may benefit from the Aviary Player. You can change viewers at any time in your project settings.'
                  ]
                }
                name='mediaPlayer'
                optionLeft={{
                  value: 'universal',
                  label: t['Universal Viewer'],
                }}
                optionRight={{ value: 'aviary', label: t['Aviary Player'] }}
                required
              />

              <ToggleInput
                label={t['Auto-populate Home page']}
                helperText=''
                name='autoPopulateHomePage'
              />

              <div className='project-form-divider' />
              <UserList
                label={t['Additional Users (optional)']}
                name='additionalUsers'
                addString={t['add']}
                nameString={t['User GitHub Name']}
                i18n={props.i18n}
              />

              <BottomBar>
                <div className='project-form-actions-container'>
                  <Button type='submit'>Save</Button>
                </div>
              </BottomBar>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
