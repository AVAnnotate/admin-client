import React, { useEffect, useMemo, useState } from 'react';
import './SlateInput.css';
import { ReactEditor, useSlate } from 'slate-react';
import type { SlateButtonProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import type { AVAEditor, ImageData, ImageSize } from '@ty/slate.ts';
import type { Translations } from '@ty/Types.ts';
import { ToolbarTooltip } from './ToolbarTooltip.tsx';
import { Editor } from 'slate';

export const HighlightColorButton = (props: SlateButtonProps) => {
  const editor = useSlate();
  const { t } = props.i18n;

  return (
    <ToolbarTooltip
      // @ts-ignore
      content={t.rteToolbar[props.format as string]}
    >
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
    </ToolbarTooltip>
  );
};

export const ColorButton = (props: SlateButtonProps) => {
  const editor = useSlate();
  const { t } = props.i18n;

  return (
    <ToolbarTooltip
      // @ts-expect-error
      content={t.rteToolbar[props.format as string]}
    >
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
    </ToolbarTooltip>
  );
};

export interface LinkDialogProps {
  i18n: Translations;
  icon: React.FC;
  format: string;
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
    setUrl('');
    setOpen(false);
  };

  const isActive = Editor.marks(editor)?.link;

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>
        <ToolbarTooltip
          // @ts-expect-error
          content={t.rteToolbar[props.format as string]}
        >
          <Button
            className={`link-button unstyled ${
              isActive ? 'activated-link-button' : ''
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              if (isActive) {
                Editor.removeMark(editor, 'link');
              } else {
                setOpen(true);
              }
            }}
            type='button'
          >
            <props.icon />
          </Button>
        </ToolbarTooltip>
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
              onClick={() => {
                setUrl('');
                setOpen(false);
              }}
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
  icon?: React.FC;
  onSubmit: (image: ImageData) => void;
  title: string;
  hideButton?: boolean;
  open?: boolean;
  url?: string;
  caption?: string;
  onClose?(): void;
}

export const ImageButton = (props: ImageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(props.url);
  const [caption, setCaption] = useState<string | undefined>(props.caption);

  const { t } = props.i18n;

  const submit = () => {
    url && props.onSubmit({ url, caption });
    setOpen(false);
  };

  useEffect(() => {
    if (props.open) {
      setOpen(true);
    }
  }, [props.open]);

  return (
    <Dialog.Root open={open}>
      {!props.hideButton && (
        <Dialog.Trigger asChild>
          <ToolbarTooltip content={props.title}>
            <Button
              className='image-button unstyled'
              onClick={() => setOpen(true)}
              type='button'
            >
              {props.icon && <props.icon />}
            </Button>
          </ToolbarTooltip>
        </Dialog.Trigger>
      )}
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
          <label>{t['Caption']}</label>
          <input
            name='caption'
            value={caption}
            onChange={(ev) => setCaption(ev.target.value)}
            onKeyDown={(ev) => {
              // override the default enter behavior,
              // which is to submit the parent form
              if (ev.key === 'Enter') {
                ev.preventDefault();
                submit();
              }
            }}
          />
        </div>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='unstyled'
              onClick={() => {
                setOpen(false);
                props.onClose && props.onClose();
              }}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              className='primary'
              role='button'
              onClick={() => {
                submit();
                setUrl(undefined);
                setCaption(undefined);
                props.onClose && props.onClose();
              }}
            >
              {t['save']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
