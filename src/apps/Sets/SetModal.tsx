import * as Dialog from '@radix-ui/react-dialog';
import type { AnnotationPage, Translations } from '@ty/Types.ts';
import { useState } from 'react';
import './Sets.css';
import { Button } from '@radix-ui/themes';

interface Props {
  i18n: Translations;
  set?: AnnotationPage;
  title: string;
  onClose: () => void;
  onSave: (set: AnnotationPage) => Promise<void>;
}

export const SetFormModal: React.FC<Props> = (props) => {
  const [name, setName] = useState(props.set?.set || '');

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content set-modal'>
          <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>
          <label>
            {t['Name']}
            <input
              className='text-field'
              type='text'
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </label>
          <div className='dialog-buttons'>
            <Dialog.Close asChild>
              <Button
                className='cancel-button unstyled'
                onClick={props.onClose}
              >
                {t['cancel']}
              </Button>
            </Dialog.Close>
            <Button className='primary'>{t['save']}</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
