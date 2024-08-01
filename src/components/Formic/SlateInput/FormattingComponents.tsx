import React, { useMemo, useState } from 'react';
import './SlateInput.css';
import { useSlate } from 'slate-react';
import type { SlateButtonProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import type { ImageData, ImageSize } from '@ty/slate.ts';
import type { Translations } from '@ty/Types.ts';

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

export interface LinkDialogProps {
  i18n: Translations;
  icon: React.FC;
  onSubmit: (url: string) => void;
  title: string;
}

export const LinkButton = (props: LinkDialogProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const { t } = props.i18n;

  const editor = useSlate();

  // Determine whether the user has highlighted some text.
  // We only want to enable the link button if the user
  // has some highlighted text to which to apply the link.
  const highlightedText = useMemo(() => {
    if (editor.selection) {
      return editor.selection.anchor.offset !== editor.selection.focus.offset;
    }

    return false;
  }, [editor.selection]);

  const submit = () => {
    props.onSubmit(url);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>
        <Button
          className={`link-button unstyled ${
            highlightedText ? '' : 'disabled-link-button'
          }`}
          disabled={!highlightedText}
          onClick={() => setOpen(true)}
          type='button'
        >
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title className='slate-dialog-title'>
          {props.title}
        </Dialog.Title>
        <div className='slate-dialog-body'>
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
        </div>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
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

export interface ImageDialogProps {
  i18n: Translations;
  icon: React.FC;
  onSubmit: (image: ImageData) => void;
  title: string;
}

const imageSizes = ['thumbnail', 'medium', 'large', 'full'];

export const ImageButton = (props: ImageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [size, setSize] = useState<ImageSize>('medium');

  const { t } = props.i18n;

  const submit = () => {
    props.onSubmit({ url, size });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>
        <Button
          className='image-button unstyled'
          onClick={() => setOpen(true)}
          type='button'
        >
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title className='slate-dialog-title'>
          {props.title}
        </Dialog.Title>
        <div className='slate-dialog-body'>
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
          <label>
            {t['Size']}
            <select
              className='formic-form-select'
              onChange={(ev) => setSize(ev.target.value as ImageSize)}
              value={size}
            >
              {imageSizes.map((val) => (
                <option key={val} value={val}>
                  {t[val]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
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
