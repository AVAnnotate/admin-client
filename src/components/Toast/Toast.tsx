import { useEffect, useMemo, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Check } from '@phosphor-icons/react/dist/icons/Check';
import { Warning } from '@phosphor-icons/react/dist/icons/Warning';
import { Info } from '@phosphor-icons/react/dist/icons/Info';
import type { ToastContent } from './ToastContent.ts';

const { Root, Title, Description, Action, Viewport } = RadixToast;

interface ToastProps {
  content?: ToastContent | null;

  closeAltText?: string;

  duration?: number;

  onOpenChange(open: boolean): void;
}

export const Toast = (props: ToastProps) => {
  const icon = useMemo(() => {
    if (props.content?.icon) {
      return props.content?.icon;
    } else if (props.content?.type === 'error') {
      return <X color='red' />;
    } else if (props.content?.type === 'success') {
      return <Check color='green' />;
    } else if (props.content?.type === 'warning') {
      return <Warning color='yellor' />;
    } else {
      return <Info color='primary' />;
    }
  }, [props.content]);

  // Note that we need to keep the content on screen,
  // even after the prop has gone null, for the exit anim.
  const [content, setContent] = useState(props.content);

  useEffect(() => {
    if (props.content) setContent(props.content);
  }, [props.content]);

  return (
    <>
      <Root
        className='toast'
        duration={props.duration || 5000}
        open={Boolean(props.content)}
        onOpenChange={props.onOpenChange}
      >
        <Title className='toast-title'>
          {icon} {content?.title}
        </Title>

        <Description className='toast-description'>
          {content?.description}
        </Description>

        <Action
          className='toast-action'
          asChild
          altText={props.closeAltText || 'Close alert'}
        >
          <button className='unstyled icon-only'>
            <X size={20} weight='light' />
          </button>
        </Action>
      </Root>

      <Viewport className='toast-viewport' />
    </>
  );
};

export const ToastProvider = RadixToast.Provider;
