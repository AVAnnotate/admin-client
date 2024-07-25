import type { Translations, Tag } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { useEffect, useState } from 'react';
import TagColors from '@lib/tag-colors.ts';

import './EditTagDialog.css';

export interface EditTagDialogProps {
  i18n: Translations;

  open: boolean;

  name?: string | undefined;

  category: string;

  existingTags: string[];

  onSave(tag: Tag): void;

  onClose(): void;
}

export const EditTagDialog = (props: EditTagDialogProps) => {
  const { t } = props.i18n;

  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    if (props.name) {
      setName(props.name);
    } else {
      setName(undefined);
    }
  }, [props.name]);

  const handleClose = () => {
    setName(undefined);
    props.onClose();
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content edit-tag-dialog'>
          <Dialog.Title className='dialog-title'>
            {props.name ? t['Edit Tag'] : t['Create Tag']}
          </Dialog.Title>
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
              disabled={
                !name ||
                name.length === 0 ||
                props.existingTags.includes(name.toLocaleLowerCase())
              }
              onClick={() =>
                props.onSave({ category: props.category, tag: name as string })
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
