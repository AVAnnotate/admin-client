import { useState } from 'react';
import './SlateInput.css';
import { useSlate } from 'slate-react';
import type { SlateButtonProps, SlateDialogProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Translations } from '@ty/Types.ts';
import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons';

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

interface InsertButtonProps {
  i18n: Translations;
}

export const InsertButton: React.FC<InsertButtonProps> = (props) => {
  const [open, setOpen] = useState(false)

  const { t } = props.i18n;

  return (
    <Dropdown.Root modal={false} open={open}>
      <Dropdown.Trigger asChild>
        <Button className='insert-button primary' onClick={() => setOpen(!open)}>
          {t['Insert']}
          {open
            ? <TriangleUpIcon />
            : <TriangleDownIcon />}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
          <Dropdown.Item
            className='dropdown-item'
            key='events'
            onClick={() => { }}
          >
            {t['Events']}
          </Dropdown.Item>
          <Dropdown.Item
            className='dropdown-item'
            key='events'
            onClick={() => { }}
          >
            {t['Column']}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}

export const LinkButton = (props: SlateDialogProps) => {
  const [open, setOpen] = useState(false)

  const [url, setUrl] = useState('');

  const { t } = props.i18n;

  const submit = () => {
    props.onSubmit(url)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild>
        <Button className='unstyled' onClick={() => setOpen(true)} type='button'>
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{props.title}</Dialog.Title>
        <label>
          {t['URL']}
          <input name='url' value={url} onChange={(ev) => setUrl(ev.target.value)} onKeyDown={ev => {
            // override the default enter behavior,
            // which is to submit the parent form
            if (ev.key === 'Enter') {
              ev.preventDefault();
              submit()
            }
          }} />
        </label>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button className='outline' onClick={() => setOpen(false)} role='button'>
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
