import { useState } from 'react';
import './SlateInput.css';
import { useSlate } from 'slate-react';
import type { SlateButtonProps, SlateDialogProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';

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
  const [open, setOpen] = useState(false);

  const [url, setUrl] = useState('');

  const { t } = props.i18n;

  const submit = () => {
    props.onSubmit(url);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>
        <Button
          className='unstyled'
          onClick={() => setOpen(true)}
          type='button'
        >
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{props.title}</Dialog.Title>
        <label>
          {t['URL']}
          <input
            name='url'
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            onKeyDown={(ev) => {
              // override the default enter behavior,
              // which is to submit the parent form
              if (ev.key === 'Enter') {
                ev.preventDefault();
                submit();
              }
            }}
          />
        </label>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='outline'
              onClick={() => setOpen(false)}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button className='primary' role='button' onClick={() => submit()}>
              {t['Insert']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
