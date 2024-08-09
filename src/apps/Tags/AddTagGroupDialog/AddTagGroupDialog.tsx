import type { Tags, Translations, TagGroup } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Check } from '@phosphor-icons/react/dist/icons/Check';
import { useEffect, useMemo, useState } from 'react';
import TagColors from '@lib/tag-colors.ts';

import './AddTagGroupDialog.css';

export interface AddTagGroupDialogProps {
  i18n: Translations;

  open: boolean;

  tags: Tags;

  name?: string | undefined;

  color?: string | undefined;

  onSave(group: TagGroup): void;

  onUpdate(oldGroup: TagGroup, newGroup: TagGroup): void;

  onClose(): void;
}

export const AddTagGroupDialog = (props: AddTagGroupDialogProps) => {
  const { t } = props.i18n;

  const [name, setName] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>();

  useEffect(() => {
    if (props.name) {
      setName(
        props.name === '_uncategorized_' ? t['Uncategorized'] : props.name
      );
    } else {
      setName(undefined);
    }
    if (props.color) {
      setColor(props.color);
    } else {
      setColor(undefined);
    }
  }, [props.name, props.color]);

  const existingGroups = useMemo(
    () => props.tags.tagGroups.map((g) => g.category.toLocaleLowerCase()),
    [props.tags]
  );

  const handleClose = () => {
    setName(undefined);
    setColor(undefined);
    props.onClose();
  };

  const handleSave = () => {
    props.onSave({
      color: color as string,
      category: name as string,
    });
  };

  const handleUpdate = () => {
    props.onUpdate(
      { color: props.color as string, category: props.name as string },
      {
        color: color as string,
        category: name as string,
      }
    );
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content add-tag-group-dialog'>
          <Dialog.Title className='dialog-title'>
            {props.name ? t['Edit Tag Group'] : t['Add Tag Group']}
          </Dialog.Title>
          <div className='av-label-bold add-tag-group-label'>
            {t['Tag Group Name']}
          </div>
          <input
            className='add-tag-group-name-input'
            onChange={(e) => setName(e.target.value)}
            value={name || ''}
          ></input>
          <div className='av-label-bold add-tag-group-label'>
            {t['Tag Color']}
          </div>
          <div className='add-tag-group-color-grid'>
            {TagColors.map((c) => {
              return (
                <div
                  className='add-tag-group-color-square'
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  key={c}
                >
                  {c === color && (
                    <div className='add-tag-group-color-overlay'>
                      <Check weight='bold' size={32} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className='add-tag-group-button-row'>
            <button className='outline' onClick={handleClose}>
              {t['cancel']}
            </button>
            <button
              className='primary'
              disabled={
                !name ||
                name.length === 0 ||
                existingGroups.includes(name.toLocaleLowerCase()) ||
                name === '_uncategorized_' ||
                !color ||
                color.length === 0
              }
              onClick={props.name ? handleUpdate : handleSave}
            >
              {props.name ? t['Update'] : t['Create']}
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
