import type {
  ProjectData,
  Translations,
  UserInfo,
  Project,
} from '@ty/Types.ts';
import { Formik, Form, useFormikContext } from 'formik';
import { TextInput, UserList, ToggleInput } from '@components/Formic/index.tsx';
import { useEffect, useRef, useMemo } from 'react';

import './ProjectForm.css';
import { MediaPlayerField } from './Fields.tsx';
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

  const generalRef = useRef(null);
  const userRef = useRef(null);

  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    if (
      (values as Project).is_private &&
      (values as Project).generate_pages_site
    ) {
      setFieldValue('generate_pages_site', false);
    }
  }, [values]);

  useEffect(() => {
    const executeScroll = (ref: React.MutableRefObject<HTMLElement | null>) =>
      ref.current!.scrollIntoView({ block: 'start' });

    if (props.selection === 'general') {
      executeScroll(generalRef);
    } else {
      executeScroll(userRef);
    }
  }, [props.selection]);

  return (
    <div className='project-form'>
      <div className='project-form-container'>
        <Form>
          <div ref={generalRef} />
          <h2>{t['General']}</h2>
          {props.projectData.project.creator ===
            props.userInfo.profile.gitHubName && (
            <>
              <ToggleInput
                label={t['Use Private Repository']}
                name='is_private'
                helperText={t['_private_repository_helper_text_']}
              />

              <ToggleInput
                label={t['Generate GitHub Pages Site']}
                name='generate_pages_site'
                helperText={t['_generate_pages_site_helper_text_']}
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

          {/* <MediaPlayerField i18n={props.i18n} /> */}

          <div className='project-form-divider' />
          <div ref={userRef} />
          {props.projectData.project.creator ===
            props.userInfo.profile.gitHubName && (
            <>
              <h2>{t['Users']}</h2>
              <UserList
                label={t['Users']}
                name='additional_users'
                addString={t['add']}
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
