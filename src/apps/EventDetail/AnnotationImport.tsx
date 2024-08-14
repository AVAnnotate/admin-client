import { SpreadsheetInput } from '@components/Formic/SpreadsheetInput/SpreadsheetInput.tsx';
import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@radix-ui/themes';
import type { AnnotationPage, Translations } from '@ty/Types.ts';
import { useState } from 'react';

interface Props {
  i18n: Translations;
  onClose: () => void;
  onImport: () => Promise<any>;
  set: string;
}

export const AnnotationImport: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);

  const { t } = props.i18n;

  return (
    <Dialog.Root>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          {loading && <LoadingOverlay />}
          <Dialog.Title>{t['Import Annotations']}</Dialog.Title>
          <div>
            <p>coming soon!</p>
          </div>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
              aria-label='Close'
              onClick={props.onClose}
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
