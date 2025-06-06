import type { ProjectData, Translations, UserInfo } from '@ty/Types.ts';
import { Formik, Form } from 'formik';
import { TextInput, UserList, ToggleInput } from '@components/Formic/index.tsx';
import { useMemo } from 'react';

import './ProjectForm.css';
import { BottomBar } from '@components/BottomBar/index.ts';
import { Button } from '@radix-ui/themes';
import type { apiProjectPut } from '@ty/api.ts';

export interface EditProjectFormProps {
  projectData: ProjectData;

  projectSlug: string;

  i18n: Translations;

  selection: string;

  onSave(project: apiProjectPut): void;

  userInfo: UserInfo;
}

const FormContents = (props: EditProjectFormProps) => {
  const { t } = props.i18n;

  return (
    <div className='project-form'>
      <div className='project-form-container'>
        <Form>
          <h1>{t['Edit Project']}</h1>
          <h2>{t['General']}</h2>
          {props.projectData.project.creator ===
            props.userInfo.profile.gitHubName && (
            <>
              <ToggleInput
                label={t['Use Private Repository']}
                name='is_private'
                helperText={t['_private_repository_helper_text_']}
              />
            </>
          )}

          <TextInput
            label={t['Title']}
            helperText={
              t['A title that will show up at the top of your project pages.']
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
          {props.projectData.project.creator ===
            props.userInfo.profile.gitHubName && (
            <>
              <h2>{t['Collaborators']}</h2>
              <UserList
                label={t['Collaborators']}
                name='additional_users'
                addString={t['Add Collaborator']}
                nameString={t['User GitHub Name']}
                i18n={props.i18n}
              />
            </>
          )}
          <BottomBar>
            <div className='project-form-actions-container'>
              <Button className='primary' type='submit'>
                {t['save']}
              </Button>
              <a href={`/${props.i18n.lang}/projects/${props.projectSlug}`}>
                <Button type='submit' className='outline'>
                  {t['cancel']}
                </Button>
              </a>
            </div>
          </BottomBar>
        </Form>
      </div>
    </div>
  );
};

export const EditProjectForm: React.FC<EditProjectFormProps> = (props) => {
  const initialValues = useMemo(() => {
    return {
      additional_users: props.projectData.users.filter((u) => !u.admin),
      description: props.projectData.project.description,
      media_player: props.projectData.project.media_player,
      authors: props.projectData.project.authors,
      title: props.projectData.project.title,
      is_private: !!props.projectData.project.is_private,
      generate_pages_site:
        props.projectData.project.generate_pages_site ||
        props.projectData.publish.publish_pages_app,
    };
  }, [props.projectData]);

  return (
    <Formik initialValues={initialValues} onSubmit={props.onSave}>
      <FormContents {...props} />
    </Formik>
  );
};
