import { TriangleDownIcon, CheckIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
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
  const { t } = props.i18n;

  return (
    <Select.Root value={props.currentFormat} onValueChange={props.onSetFormat}>
      <Select.Trigger className='select-trigger format-text-trigger'>
        <Select.Value className='select-value' />
        <Select.Icon className='select-icon'>
          {<TriangleDownIcon />}
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className='select-content'>
          <Select.Viewport>
            <Select.Item className='select-item' value='normal'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['normal']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item className='select-item' value='small'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['small']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item className='select-item' value='heading-one'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['heading-one']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item className='select-item' value='heading-two'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['heading-two']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item className='select-item' value='heading-three'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['heading-three']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
            <Select.Item className='select-item' value='heading-four'>
              {/* @ts-ignore */}
              <Select.ItemText>{t.rteToolbar['heading-four']}</Select.ItemText>
              <Select.ItemIndicator className='SelectItemIndicator'>
                <CheckIcon />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
