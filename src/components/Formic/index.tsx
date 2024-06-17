import {
  Field,
  ErrorMessage,
  type FieldInputProps,
  type FieldMetaProps,
  useField,
  type FieldProps,
  useFormikContext,
} from 'formik';
import { Button, Switch } from '@radix-ui/themes';
import './Formic.css';
import { Avatar } from '@components/Avatar/index.ts';
import type { Translations, UserProfile } from '@ty/Types.ts';
import { Trash } from '@phosphor-icons/react/Trash';
import { useCallback, useState } from 'react';
import { Plus } from '@phosphor-icons/react/Plus';
import { UploadSimple } from '@phosphor-icons/react/UploadSimple';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/icons/MagnifyingGlass';

const Required = () => {
  return <div className='formic-form-required'>*</div>;
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

interface TimeInputProps {
  defaultValue: number;
  label?: string;
  onChange: (input: number) => any;
  required?: boolean;
  className?: string;
}

export const TimeInput = (props: TimeInputProps) => {
  const valueToDisplay = useCallback((seconds: number) => {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }, [])

  const [display, setDisplay] = useState(valueToDisplay(props.defaultValue));

  const onChange = useCallback((event: any) => {
    const input = event.target.value.replaceAll(':', '')

    if (!isNaN(input)) {
      const seconds = input.length >= 2
        ? parseInt(input.slice(-2))
        : parseInt(input) || 0

      const minutes = input.length > 2 && input.length < 5
        ? parseInt(input.slice(0, input.length - 2))
        : parseInt(input.slice(-4, -2)) || 0

      const hours = parseInt(input.slice(0, input.length - 4)) || 0

      if (hours < 24) {
        const totalSeconds = seconds + (minutes * 60) + (hours * 3600)
        setDisplay(valueToDisplay(totalSeconds))
        // setDisplay(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

        props.onChange(totalSeconds)
      }

    }
  }, [])

  return (
    <div className={`formic-form-field ${props.className}`}>
      {props.label && (
        <div className='av-label-bold formic-form-label'>
          {props.label}
          {props.required && <Required />}
        </div>
      )}
      <input
        className='formic-form-text'
        onChange={onChange}
        value={display}
      />
    </div>
  )
}

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
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const { value } = meta;
  const { setValue } = helpers;

  const handleChange = (change: string) => { };
  const handleAddUser = () => {
    let val: UserProfile[] = [...value];
    val.push({
      name: '',
      gitHubName: newValue,
    });

    setValue(val);
    setNewValue('');
    setAdding(false);
  };

  return (
    <div>
      <div className='av-label-bold formic-form-label'>
        {props.label}
        {props.required && <Required />}
      </div>
      {value.map((user: UserProfile) => (
        <div className='formic-user-list-row' key={user.gitHubName}>
          <div className='formnic-user-list-user-box'>
            <Avatar name={user.gitHubName} avatar={user.avatarURL} />
            <div className='formic-user-list-names'>
              <div className='av-label-bold'>{user.name}</div>
              <div className='av-label'>{user.gitHubName}</div>
            </div>
          </div>
          <Trash />
        </div>
      ))}
      <div className='formic-user-list-add'>
        {adding ? (
          <div className='formic-user-list-add'>
            <div className='av-label-bold formic-form-label'>
              {props.nameString}
              <Required />
            </div>
            <input
              value={newValue}
              onChange={(ev) => setNewValue(ev.target.value)}
              className='formic-form-text formic-add-user-input'
            ></input>
            <Button
              className='primary formic-add-user-save-button'
              onClick={handleAddUser}
            >
              <UploadSimple />
              <div>{props.addString}</div>
            </Button>
          </div>
        ) : (
          <Button className='primary' onClick={() => setAdding(true)}>
            <Plus />
            <div>{props.addString}</div>
          </Button>
        )}
      </div>
    </div>
  );
};
