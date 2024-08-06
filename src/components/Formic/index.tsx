import { Button } from '@radix-ui/themes';
import { Field, ErrorMessage, useField, useFormikContext } from 'formik';
import './Formic.css';
import { Avatar } from '@components/Avatar/index.ts';
import type { ProjectData, ProviderUser, Translations } from '@ty/Types.ts';
import { Trash } from '@phosphor-icons/react/Trash';
import { useCallback, useState, type ReactElement } from 'react';
import { SearchUsers } from '@components/SearchUsers/index.ts';
import { SlateInput } from './SlateInput/index.ts';
import * as Switch from '@radix-ui/react-switch';
import { CheckIcon } from '@radix-ui/react-icons';

export const Required = () => {
  return <div className='formic-form-required'>*</div>;
};

const validateRequiredField = (name: string, value: any) => {
  if (!value) {
    return `Missing value for ${name}.`;
  }
};

interface TextInputProps {
  label?: string;
  helperText?: string;
  name: string;
  isLarge?: boolean;
  required?: boolean;
  bottomNote?: string;
  className?: string;
}

export const TextInput = (props: TextInputProps) => {
  return (
    <div className={`formic-form-field ${props.className}`}>
      {props.label && (
        <div className='av-label-bold formic-form-label'>
          {props.label}
          {props.required && <Required />}
        </div>
      )}
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
        validate={(val: any) =>
          props.required ? validateRequiredField(props.name, val) : undefined
        }
      />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
      <ErrorMessage name={props.name} component='div' />
    </div>
  );
};

interface RichTextInputProps extends Omit<TextInputProps, 'isLarge'> {
  initialValue?: any;
  name: string;
  i18n: Translations;
  children?: ReactElement | ReactElement[];
  project?: ProjectData;
}

export const RichTextInput = (props: RichTextInputProps) => {
  const { setFieldValue, values } = useFormikContext();

  return (
    <div className={`formic-form-field ${props.className || ''}`}>
      {props.label && (
        <div className='av-label-bold formic-form-label'>
          {props.label}
          {props.required && <Required />}
        </div>
      )}
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <SlateInput
        onChange={(data) => setFieldValue(props.name, data)}
        i18n={props.i18n}
        initialValue={(values as any)[props.name] || props.initialValue}
        project={props.project}
      >
        {props.children}
      </SlateInput>
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
      <ErrorMessage name={props.name} component='div' />
    </div>
  );
};

interface TimeInputProps {
  initialValue: number;
  label?: string;
  onChange: (input: number) => any;
  required?: boolean;
  className?: string;
}

export const TimeInput = (props: TimeInputProps) => {
  const valueToDisplay = useCallback((seconds: number) => {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }, []);

  const [display, setDisplay] = useState(valueToDisplay(props.initialValue));

  const onChange = useCallback((event: any) => {
    const input = event.target.value.replaceAll(':', '');

    if (!isNaN(input)) {
      const seconds =
        input.length >= 2 ? parseInt(input.slice(-2)) : parseInt(input) || 0;

      const minutes =
        input.length > 2 && input.length < 5
          ? parseInt(input.slice(0, input.length - 2))
          : parseInt(input.slice(-4, -2)) || 0;

      const hours = parseInt(input.slice(0, input.length - 4)) || 0;

      if (hours < 24) {
        const totalSeconds = seconds + minutes * 60 + hours * 3600;
        setDisplay(valueToDisplay(totalSeconds));
        // setDisplay(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

        props.onChange(totalSeconds);
      }
    }
  }, []);

  return (
    <div className={`formic-form-field ${props.className || ''}`}>
      {props.label && (
        <div className='av-label-bold formic-form-label formic'>
          <span>{props.label}</span>
          {props.required && <Required />}
        </div>
      )}
      <input
        className='formic-form-text formic-time-input'
        onChange={onChange}
        value={display}
      />
    </div>
  );
};

export interface SelectInputProps {
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
        {/* empty option to allow the user to leave the input blank */}
        {!props.required && <option />}
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

interface TripleSwitchInputProps {
  label: string;
  helperText?: string;
  name: string;
  optionLeft: { label: string; value: string };
  optionMiddle: { label: string; value: string };
  optionRight: { label: string; value: string };
  required?: boolean;
  bottomNote?: string;
}

export const TripleSwitchInput = (props: TripleSwitchInputProps) => {
  const [field, meta, helpers] = useField(props.name);

  const { value } = meta;
  const { setValue } = helpers;
  return (
    <div>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <div className='formic-form-switch'>
        <Button
          type='button'
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
          type='button'
          className={
            value === props.optionMiddle.value
              ? 'unstyled formic-form-switch-button formic-form-switch-button-middle formic-form-switch-button-selected'
              : 'unstyled formic-form-switch-button formic-form-switch-button-middle'
          }
          onClick={() => setValue(props.optionMiddle.value)}
        >
          {props.optionMiddle.label}
        </Button>
        <Button
          type='button'
          className={
            value === props.optionRight.value
              ? 'unstyled formic-form-switch-button formic-form-switch-button-right formic-form-switch-button-selected'
              : 'unstyled formic-form-switch-button formic-form-switch-button-right'
          }
          onClick={() => setValue(props.optionRight.value)}
        >
          {props.optionRight.label}
        </Button>
      </div>
      <ErrorMessage name={props.name} component='div' />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
    </div>
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
    <div className='formic-form-switch-container'>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {props.helperText && (
        <div className='av-label formic-form-helper-text'>
          {props.helperText}
        </div>
      )}
      <Switch.Root
        checked={value}
        onCheckedChange={(checked) => setValue(checked)}
        className='formic-toggle-switch'
      >
        <CheckIcon className='formic-toggle-switch-icon' />
        <Switch.Thumb className='formic-toggle-switch-thumb' />
      </Switch.Root>
      <ErrorMessage name={props.name} component='div' />
      {props.bottomNote && (
        <div className='av-label-italic formic-form-helper-text'>
          {props.bottomNote}
        </div>
      )}
    </div>
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

  const handleDeleteUser = (user: ProviderUser) => {
    setValue(
      value.filter((v: ProviderUser) => v.login_name !== user.login_name)
    );
  };

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
          <div className='formic-user-list-row' key={user.login_name}>
            <div className='formnic-user-list-user-box'>
              <Avatar name={user.name} avatar={user.avatar_url} />
              <div className='formic-user-list-names'>
                <div className='av-label-bold'>{user.name}</div>
                <div className='av-label'>{user.login_name}</div>
              </div>
            </div>
            <Button className='formic-user-list-delete-button' type='button'>
              <Trash onClick={() => handleDeleteUser(user)} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
