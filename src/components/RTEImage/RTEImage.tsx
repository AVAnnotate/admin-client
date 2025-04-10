import { useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { Translations } from '@ty/Types.ts';
import { ImageScaler } from './ImageScaler.tsx';
import { ImageButton } from '@components/Formic/SlateInput/FormattingComponents.tsx';
import type { ImageData, AVAEditor } from '@ty/slate.ts';

interface RTEImageProps {
  i18n: Translations;
  url: string;
  scale: number;
  altText?: string;
  popoverAnchor: any;
  element: any;
  editor?: AVAEditor;

  onChange(property: string, value: any): void;
  onUpdateImage(editor: AVAEditor, image: ImageData, node: any): void;
}

export const RTEImage = (props: RTEImageProps) => {
  const [scaleOpen, setScaleOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const { t } = props.i18n;
  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <img
            src={props.url}
            alt={props.altText || t['Embedded Image']}
            width={`${props.scale}%`}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className='context-menu-content'>
            <ContextMenu.Item
              className='context-menu-item'
              onClick={() => setTimeout(() => setPropertiesOpen(true))}
            >
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
        anchorEl={props.popoverAnchor.current}
      />
      <ImageButton
        i18n={props.i18n}
        title={t['Update Properties']}
        hideButton
        onSubmit={(image) =>
          props.onUpdateImage &&
          props.editor &&
          props.onUpdateImage(props.editor, image, props.element)
        }
        open={propertiesOpen}
        altText={props.element.altText}
        url={props.element.url}
        onClose={() => setPropertiesOpen(false)}
      />
    </>
  );
};
