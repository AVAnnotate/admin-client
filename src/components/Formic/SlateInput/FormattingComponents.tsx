import { useState, type ReactElement } from 'react';
import './SlateInput.css';
import { useSlate } from 'slate-react';
import type { SlateButtonProps, SlateDialogProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';

interface CommonProps {
  style: { textAlign: 'left' | 'center' | 'right' | 'justify' };
  children: ReactElement | ReactElement[];
  attributes: string[];
}

export const HighlightColorButton = (props: SlateButtonProps) => {
  const editor = useSlate();

  return (
    <Button className='unstyled' type='button'>
      <label className='slate-highlight-color-button'>
        <props.icon />
        <input
          className='hidden'
          type='color'
          onChange={(ev) => editor.addMark('highlight', ev.target.value)}
        />
      </label>
    </Button>
  );
};

export const ColorButton = (props: SlateButtonProps) => {
  const editor = useSlate();

  return (
    <Button className='unstyled' type='button'>
      <label className='slate-color-button'>
        <props.icon />
        <input
          className='hidden'
          type='color'
          onChange={(ev) => editor.addMark('color', ev.target.value)}
        />
      </label>
    </Button>
  );
};

export const LinkButton = (props: SlateDialogProps) => {
  const editor = useSlate();

  const [url, setUrl] = useState<undefined | string>(undefined);

  const { t } = props.i18n;

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className='unstyled' type='button'>
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        {/* todo: link prompt */}
        <Dialog.Title>{props.title}</Dialog.Title>
        <label>
          {t['URL']}
          <input value={url} onChange={(ev) => setUrl(ev.target.value)} />
        </label>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button className='outline' role='button'>
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button className='primary' role='button'>
              {t['Insert']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
