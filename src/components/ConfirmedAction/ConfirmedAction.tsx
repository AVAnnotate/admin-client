import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react/dist/icons/X';
import type { Translations } from '@ty/Types.ts';

import './ConfirmedAction.css';

interface ConfirmationDialogProps {
  i18n: Translations;

  open: boolean;

  title: string;

  description: string;

  cancelLabel: string | ReactNode;

  confirmLabel: string | ReactNode;

  onConfirm(): void;

  onClose(): void;
}

export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay'>
          <Dialog.Content className='dialog-content' onClick={onClick}>
            <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>

            <Dialog.Description className='dialog-description'>
              {props.description}
            </Dialog.Description>

            <footer className='dialog-footer'>
              <button onClick={props.onClose}>{props.cancelLabel}</button>
              <button className='danger' onClick={props.onConfirm}>
                {props.confirmLabel}
              </button>
            </footer>

            <button
              className='unstyled icon-only confirmed-action-close'
              aria-label={props.i18n.t['Close']}
              onClick={props.onClose}
            >
              <X size='20' />
            </button>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
