import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Button } from '@radix-ui/themes';
import { useState } from 'react';
import type { Translations } from '@ty/Types.ts';

import './FormatTextButton.css';

interface FormatTextButtonProps {
  i18n: Translations;

  currentFormat: string;

  onSetFormat(format: string): void;
}

export const FormatTextButton = (props: FormatTextButtonProps) => {
  const [open, setOpen] = useState(false);

  const { t } = props.i18n;

  return (
    <Dropdown.Root modal={false} open={open}>
      <Dropdown.Trigger asChild>
        <Button className='format-text-button' onClick={() => setOpen(!open)}>
          {/* @ts-ignore */}
          {t.rteToolbar[props.currentFormat]}
          {open ? <TriangleUpIcon /> : <TriangleDownIcon />}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => {
              props.onSetFormat('normal');
              setOpen(false);
            }}
          >
            {/* @ts-ignore */}
            {t.rteToolbar['normal']}
          </Dropdown.Item>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => {
              props.onSetFormat('heading-four');
              setOpen(false);
            }}
          >
            {/* @ts-ignore */}
            {t.rteToolbar['heading-four']}
          </Dropdown.Item>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => {
              props.onSetFormat('heading-three');
              setOpen(false);
            }}
          >
            {/* @ts-ignore */}
            {t.rteToolbar['heading-three']}
          </Dropdown.Item>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => {
              props.onSetFormat('heading-two');
              setOpen(false);
            }}
          >
            {/* @ts-ignore */}
            {t.rteToolbar['heading-two']}
          </Dropdown.Item>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => {
              props.onSetFormat('heading-one');
              setOpen(false);
            }}
          >
            {/* @ts-ignore */}
            {t.rteToolbar['heading-one']}
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
