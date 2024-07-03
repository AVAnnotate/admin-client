import type { ReactElement } from 'react';
import './SlateInput.css';
import { useSlate } from 'slate-react';
import type { SlateButtonProps } from '@ty/ui.ts';
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

export const LinkButton = (props: SlateButtonProps) => {
  const editor = useSlate();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className='unstyled' type='button'>
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          {/* todo: link prompt */}
          <Dialog.Title>hi</Dialog.Title>
          <Dialog.Description></Dialog.Description>
          <fieldset className='Fieldset'>
            <label className='Label' htmlFor='name'>
              Name
            </label>
            <input className='Input' id='name' defaultValue='Pedro Duarte' />
          </fieldset>
          <Dialog.Close>close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const ImageButton = (props: SlateButtonProps) => {
  const editor = useSlate();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className='unstyled' type='button'>
          <props.icon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          {/* todo: image URL prompt */}
          <Dialog.Title>hi</Dialog.Title>
          <Dialog.Description></Dialog.Description>
          <fieldset className='Fieldset'>
            <label className='Label' htmlFor='name'>
              Name
            </label>
            <input className='Input' id='name' defaultValue='Pedro Duarte' />
          </fieldset>
          <Dialog.Close>close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
