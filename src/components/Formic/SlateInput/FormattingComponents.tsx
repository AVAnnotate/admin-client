import { useCallback, useState } from 'react';
import './SlateInput.css';
import { ReactEditor, useSlate } from 'slate-react';
import type { SlateButtonProps, SlateDialogProps } from '@ty/ui.ts';
import { Button } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Translations } from '@ty/Types.ts';
import {
  ChevronRightIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from '@radix-ui/react-icons';
import { Transforms, type BaseEditor } from 'slate';

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

const insertColumns = (
  editor: BaseEditor & ReactEditor,
  newLayout: ColumnLayout
) => {
  const paragraph = { type: 'paragraph', children: [{ text: '' }] };

  const columns = [
    {
      type: 'grid',
      layout: newLayout,
      children: [
        {
          type: 'column',
          children: [paragraph],
        },
        {
          type: 'column',
          children: [paragraph],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  Transforms.insertNodes(editor, columns);
};

interface InsertModalProps {
  i18n: Translations;
  clearModal: () => void;
}

const SingleEventModal: React.FC<InsertModalProps> = (props) => {
  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Overlay className='slate-dialog-overlay' />
      <Dialog.Content className='slate-dialog-content'>
        <Dialog.Title>{t['Insert event']}</Dialog.Title>
        <div className='slate-dialog-close-bar'>
          <Dialog.Close asChild>
            <Button
              className='outline'
              onClick={props.clearModal}
              role='button'
            >
              {t['cancel']}
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button
              className='primary'
              role='button'
              onClick={() => console.log('todo')}
            >
              {t['Insert']}
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

type InsertButtonModalTypes = 'single-event' | 'event-compare';
type ColumnLayout = [2, 4] | [3, 3] | [4, 2];

interface InsertButtonProps {
  i18n: Translations;
}

export const InsertButton: React.FC<InsertButtonProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<InsertButtonModalTypes | null>(null);

  const editor = useSlate();

  const { t } = props.i18n;

  const clearModal = useCallback(() => setModal(null), []);

  const updateModal = useCallback((newModal: InsertButtonModalTypes) => {
    setModal(newModal);
    setOpen(false);
  }, []);

  const updateColumnLayout = useCallback((newLayout: ColumnLayout) => {
    insertColumns(editor, newLayout);
    setOpen(false);
  }, []);

  return (
    <>
      {modal === 'single-event' && (
        <SingleEventModal i18n={props.i18n} clearModal={clearModal} />
      )}
      <Dropdown.Root modal={false} open={open}>
        <Dropdown.Trigger asChild>
          <Button
            className='insert-button primary'
            onClick={() => setOpen(!open)}
          >
            {t['Insert']}
            {open ? <TriangleUpIcon /> : <TriangleDownIcon />}
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
            <Dropdown.Sub>
              <Dropdown.SubTrigger className='dropdown-item dropdown-subtrigger'>
                {t['Column']}
                <ChevronRightIcon />
              </Dropdown.SubTrigger>
              <Dropdown.Portal>
                <Dropdown.SubContent className='dropdown-content meatball-dropdown-content'>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([2, 4])}
                  >
                    {t['1/3 + 2/3']}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([3, 3])}
                  >
                    {t['1/2 + 1/2']}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className='dropdown-item'
                    onClick={() => updateColumnLayout([4, 2])}
                  >
                    {t['2/3 + 1/3']}
                  </Dropdown.Item>
                </Dropdown.SubContent>
              </Dropdown.Portal>
            </Dropdown.Sub>
            <Dropdown.Item
              className='dropdown-item'
              onClick={() => updateModal('single-event')}
            >
              {t['Single event']}
            </Dropdown.Item>
            <Dropdown.Item
              className='dropdown-item'
              onClick={() => updateModal('event-compare')}
            >
              {t['Event comparison']}
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </>
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
