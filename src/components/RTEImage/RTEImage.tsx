import { useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { Translations } from '@ty/Types.ts';
import { ImageScaler } from './ImageScaler.tsx';

interface RTEImageProps {
  i18n: Translations;
  url: string;
  scale: number;
  altName?: string;

  onChange(property: string, value: any): void;
}

export const RTEImage = (props: RTEImageProps) => {
  const [scaleOpen, setScaleOpen] = useState(false);

  const { t } = props.i18n;
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <img
            src={props.url}
            alt={props.altName || t['Embedded Image']}
            width={`${props.scale}%`}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className='context-menu-content'>
            <ContextMenu.Item className='context-menu-item'>
              {t['Edit Properties']}
            </ContextMenu.Item>
            <ContextMenu.Item
              className='context-menu-item'
              onClick={() => setTimeout(() => setScaleOpen(true))}
            >
              {t['Resize']}
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <ImageScaler
        scale={props.scale}
        i18n={props.i18n}
        onScale={(scale) => props.onChange('scale', scale)}
        open={scaleOpen}
        onClose={() => setScaleOpen(false)}
      />
    </>
  );
};
