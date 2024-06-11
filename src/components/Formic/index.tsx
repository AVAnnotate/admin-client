import {
  Field,
  ErrorMessage,
  type FieldInputProps,
  type FieldMetaProps,
  useField,
} from 'formik';
import { Button, Switch } from '@radix-ui/themes';
import './Formic.css';
import { Avatar } from '@components/Avatar/index.ts';
import type { ProviderUser, Translations, UserProfile } from '@ty/Types.ts';
import { Trash } from '@phosphor-icons/react/Trash';
import { useState } from 'react';
import { Plus } from '@phosphor-icons/react/Plus';
import { UploadSimple } from '@phosphor-icons/react/UploadSimple';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/icons/MagnifyingGlass';
import { SearchUsers } from '@components/SearchUsers/index.ts';

const Required = () => {
  return <div className='formic-form-required'>*</div>;
};

interface TextInputProps {
  label: string;
  helperText?: string;
  name: string;
  isLarge?: boolean;
  required?: boolean;
  bottomNote?: string;
}

export const TextInput = (props: TextInputProps) => {
  return (
    <>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <Field
        type='text'
        name={props.name}
        className={props.isLarge ? 'formic-form-textarea' : 'formic-form-text'}
        as={props.isLarge ? 'textarea' : 'input'}
      />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
      <ErrorMessage name={props.name} component='div' />
    </>
  );
};

interface SelectInputProps {
  label: string;
  helperText?: string;
  name: string;
  options: { label: string; value: string }[];
  required?: boolean;
  bottomNote?: string;
}

export const SelectInput = (props: SelectInputProps) => {
  return (
    <>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <Field as='select' name={props.name} className='formic-form-select'>
        {props.options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </Field>
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
      <ErrorMessage name={props.name} component='div' />
    </>
  );
};

interface SwitchInputProps {
  label: string;
  helperText?: string;
  name: string;
  optionLeft: { label: string; value: string };
  optionRight: { label: string; value: string };
  required?: boolean;
  bottomNote?: string;
}

export const SwitchInput = (props: SwitchInputProps) => {
  const [field, meta, helpers] = useField(props.name);

  const { value } = meta;
  const { setValue } = helpers;
  return (
    <>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <Button
        className={
          value === props.optionLeft.value
            ? 'unstyled formic-form-switch-button formic-form-switch-button-left formic-form-switch-button-selected'
            : 'unstyled formic-form-switch-button formic-form-switch-button-left'
        }
        onClick={() => setValue(props.optionLeft.value)}
      >
        {props.optionLeft.label}
      </Button>
      <Button
        className={
          value === props.optionRight.value
            ? 'unstyled formic-form-switch-button formic-form-switch-button-right formic-form-switch-button-selected'
            : 'unstyled formic-form-switch-button formic-form-switch-button-right'
        }
        onClick={() => setValue(props.optionRight.value)}
      >
        {props.optionRight.label}
      </Button>
      <ErrorMessage name={props.name} component='div' />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
    </>
  );
};

interface ToggleInputProps {
  label: string;
  helperText?: string;
  name: string;
  required?: boolean;
  bottomNote?: string;
}

export const ToggleInput = (props: ToggleInputProps) => {
  const [field, meta, helpers] = useField(props.name);

  const { value } = meta;
  const { setValue } = helpers;
  return (
    <>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <Switch
        size='3'
        checked={value}
        onCheckedChange={(checked) => setValue(checked)}
      />
      <ErrorMessage name={props.name} component='div' />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
    </>
  );
};

interface UserListProps {
  label: string;
  helperText?: string;
  required?: boolean;
  name: string;
  addString: string;
  nameString: string;
  i18n: Translations;
}

export const UserList = (props: UserListProps) => {
  const [field, meta, helpers] = useField(props.name);

  const { value } = meta;
  const { setValue } = helpers;

  return (
    <div>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      <SearchUsers
        buttonText={props.addString}
        i18n={props.i18n}
        onSelect={(val) => {
          setValue([...value, val]);
        }}
      />
      <div className='formic-user-list'>
        {value.map((user: ProviderUser) => (
          <div className='formic-user-list-row' key={user.loginName}>
            <div className='formnic-user-list-user-box'>
              <Avatar name={user.name} avatar={user.avatarURL} />
              <div className='formic-user-list-names'>
                <div className='av-label-bold'>{user.name}</div>
                <div className='av-label'>{user.loginName}</div>
              </div>
            </div>
            <Button className='formic-user-list-delete-button'>
              <Trash />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
