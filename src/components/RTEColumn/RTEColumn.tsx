import type { Translations } from '@ty/Types.ts';
import { useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { PaddingControl } from './PaddingControl.tsx';
import './RTEColumn.css';

interface RTEColumnProps {
  i18n: Translations;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;

  showGridlines?: boolean;

  children: any;

  onChange(property: string, value: any): void;
}

export const RTEColumn = (props: RTEColumnProps) => {
  const [paddingOpen, setPaddingOpen] = useState(false);

  const { t } = props.i18n;
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            className='rte-column-container'
            style={{
              paddingLeft: `${props.paddingLeft || 0}%`,
              paddingRight: `${props.paddingRight || 0}%`,
              paddingTop: `${props.paddingTop || 0}%`,
              paddingBottom: `${props.paddingBottom || 0}%`,
            }}
          >
            {props.showGridlines && (
              <div
                className='rte-column-left-gridline'
                style={{ top: 0, left: `${props.paddingLeft}%` }}
              />
            )}
            {props.showGridlines && (
              <div
                className='rte-column-right-gridline'
                style={{ top: 0, right: `${props.paddingRight}%` }}
              />
            )}
            {props.showGridlines && (
              <div
                className='rte-column-top-gridline'
                style={{ top: `${props.paddingTop}%`, left: 0 }}
              />
            )}
            {props.showGridlines && (
              <div
                className='rte-column-bottom-gridline'
                style={{ bottom: `${props.paddingBottom}%`, left: 0 }}
              />
            )}
            {props.children}
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className='context-menu-content'>
            <ContextMenu.Item
              className='context-menu-item'
              onClick={() => setTimeout(() => setPaddingOpen(true))}
            >
              {t['Set Padding']}
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <PaddingControl
        paddingLeft={props.paddingLeft || 0}
        paddingRight={props.paddingRight || 0}
        paddingTop={props.paddingTop || 0}
        paddingBottom={props.paddingBottom || 0}
        i18n={props.i18n}
        onChange={(side, value) => props.onChange(side, value)}
        open={paddingOpen}
        onClose={() => setPaddingOpen(false)}
      />
    </>
  );
};
