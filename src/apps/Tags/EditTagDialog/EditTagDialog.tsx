import type { Translations, Tag } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { useEffect, useMemo, useState } from 'react';
import { SelectGroup } from './SelectGroup.tsx';

import './EditTagDialog.css';

export interface EditTagDialogProps {
  i18n: Translations;

  open: boolean;

  name?: string | undefined;

  category: string;

  existingTags: string[];

  availableGroups: string[];

  onSave(tag: Tag): void;

  onClose(): void;

  onChangeGroup(group: string): void;
}

export const EditTagDialog = (props: EditTagDialogProps) => {
  const { t } = props.i18n;

  const [name, setName] = useState<string | undefined>();
  const [group, setGroup] = useState<string | undefined>();

  useEffect(() => {
    if (props.name) {
      setName(props.name);
    } else {
      setName(undefined);
    }

    if (props.category) {
      setGroup(props.category);
    } else {
      setGroup(undefined);
    }
  }, [props.name]);

  const handleClose = () => {
    setName(undefined);
    props.onClose();
  };

  const handleChangeGroup = (group: string) => {
    setGroup(group);
    props.onChangeGroup(group);
  };

  const exists = useMemo(() => {
    if (name) {
      const idx = props.existingTags.findIndex(
        (t) => t === name.toLocaleLowerCase()
      );
      if (idx > -1) {
        // If this is edit, does the existing name match the current name in lower case
        if (props.name) {
          if (
            props.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
            props.name !== name
          ) {
            return false;
          }
        }

        return true;
      }
    }

    return false;
  }, [name, props.existingTags]);
  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content edit-tag-dialog'>
          <Dialog.Title className='dialog-title'>
            {props.name ? t['Edit Tag'] : t['Create Tag']}
          </Dialog.Title>
          <div className='av-label-bold edit-tag-label'>{t['Tag Name']}</div>
          <SelectGroup
            group={group}
            onChange={handleChangeGroup}
            groups={props.availableGroups}
            disabled={!props.name}
            i18n={props.i18n}
          />
          <div className='av-label-bold edit-tag-label'>{t['Tag Name']}</div>
          <input
            className='edit-tag-name-input'
            onChange={(e) => setName(e.target.value)}
            value={name || ''}
          ></input>
          <div className='edit-tag-button-row'>
            <button className='outline' onClick={handleClose}>
              {t['cancel']}
            </button>
            <button
              className='primary'
              disabled={!name || name.length === 0 || exists}
              onClick={() =>
                props.onSave({ category: group as string, tag: name as string })
              }
            >
              {t['save']}
            </button>
          </div>
          <button
            className='dialog-close-button'
            aria-label='Close'
            onClick={handleClose}
          >
            <X size={24} />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
