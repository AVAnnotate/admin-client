import { useEffect, useRef, useState } from 'react';
import type { Translations } from '@ty/Types.ts';
import * as Popover from '@radix-ui/react-popover';
import { TextField } from '@radix-ui/themes';
import {
  PinLeftIcon,
  PinTopIcon,
  PinBottomIcon,
  PinRightIcon,
} from '@radix-ui/react-icons';

import './RTEColumn.css';

interface PaddingControlProps {
  anchorEl: any;
  i18n: Translations;
  open: boolean;

  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;

  onChange(side: string, value: number): void;
  onClose(): void;
}

export const PaddingControl = (props: PaddingControlProps) => {
  const { t } = props.i18n;

  const [initialValues, setInitialValue] = useState({
    left: props.paddingLeft,
    right: props.paddingRight,
    top: props.paddingTop,
    bottom: props.paddingBottom,
  });

  const [currentValues, setCurrentValues] = useState({
    left: props.paddingLeft.toString(),
    right: props.paddingRight.toString(),
    top: props.paddingTop.toString(),
    bottom: props.paddingBottom.toString(),
  });

  const virtualRef = useRef<any | null>(null);

  if (props.anchorEl) virtualRef.current = props.anchorEl;

  useEffect(() => {
    setInitialValue({
      left: props.paddingLeft,
      right: props.paddingRight,
      top: props.paddingTop,
      bottom: props.paddingBottom,
    });
  }, []);

  useEffect(() => {
    setCurrentValues({
      left: props.paddingLeft.toString(),
      right: props.paddingRight.toString(),
      top: props.paddingTop.toString(),
      bottom: props.paddingBottom.toString(),
    });
  }, [props]);

  const checkAndSendChange = (side: string, strValue: string) => {
    if (strValue.length === 0) {
      let vals = { ...currentValues };
      // @ts-ignore
      vals[side] = '';
      setCurrentValues(vals);
      return;
    }
    const val = parseInt(strValue);
    if (!isNaN(val)) {
      if (val <= 100) {
        props.onChange(side, val);
      }
    }
  };

  const valid =
    currentValues.bottom.length > 0 &&
    parseInt(currentValues.bottom) <= 100 &&
    currentValues.top.length > 0 &&
    parseInt(currentValues.top) <= 100 &&
    currentValues.left.length > 0 &&
    parseInt(currentValues.left) <= 100 &&
    currentValues.right.length > 0 &&
    parseInt(currentValues.right) <= 100;

  return (
    <Popover.Root open={props.open}>
      <Popover.Anchor virtualRef={virtualRef} />
      <Popover.Portal>
        <Popover.Content
          className='popover-content rte-padding-content'
          side='top'
        >
          <div className='rte-padding-container'>
            <h2>{t['Add Padding']}</h2>
            <div className='rte-padding-input-row'>
              <div className='rte-padding-input'>
                <PinTopIcon width={32} height={32} />
                <TextField.Root
                  size='2'
                  value={currentValues.top}
                  onChange={(ev) => {
                    checkAndSendChange('top', ev.target.value);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Backspace') {
                      checkAndSendChange(
                        'top',
                        props.paddingTop.toString().slice(0, -1)
                      );
                    }
                  }}
                >
                  <TextField.Slot
                    side='right'
                    className='rte-padding-input-slot'
                  >
                    %
                  </TextField.Slot>
                </TextField.Root>
              </div>
            </div>
            <div className='rte-padding-input-row-center'>
              <div className='rte-padding-input'>
                <PinLeftIcon width={32} height={32} />
                <TextField.Root
                  size='2'
                  value={currentValues.left}
                  onChange={(ev) => {
                    checkAndSendChange('left', ev.target.value);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Backspace') {
                      checkAndSendChange(
                        'left',
                        props.paddingLeft.toString().slice(0, -1)
                      );
                    }
                  }}
                >
                  <TextField.Slot
                    side='right'
                    className='rte-padding-input-slot'
                  >
                    %
                  </TextField.Slot>
                </TextField.Root>
              </div>
              <div className='rte-padding-input'>
                <PinRightIcon width={32} height={32} />
                <TextField.Root
                  size='2'
                  value={currentValues.right}
                  onChange={(ev) => {
                    checkAndSendChange('right', ev.target.value);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Backspace') {
                      checkAndSendChange(
                        'right',
                        props.paddingRight.toString().slice(0, -1)
                      );
                    }
                  }}
                >
                  <TextField.Slot
                    side='right'
                    className='rte-padding-input-slot'
                  >
                    %
                  </TextField.Slot>
                </TextField.Root>
              </div>
            </div>
            <div className='rte-padding-input-row'>
              <div className='rte-padding-input'>
                <PinBottomIcon width={32} height={32} />
                <TextField.Root
                  size='2'
                  defaultValue={currentValues.bottom}
                  onChange={(ev) => {
                    checkAndSendChange('bottom', ev.target.value);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Backspace') {
                      checkAndSendChange(
                        'bottom',
                        props.paddingBottom.toString().slice(0, -1)
                      );
                    }
                  }}
                >
                  <TextField.Slot
                    side='right'
                    className='rte-padding-input-slot'
                  >
                    %
                  </TextField.Slot>
                </TextField.Root>
              </div>
            </div>
            <div className='rte-padding-button-container'>
              <button
                className='Button unstyled rte-padding-input-cancel-button av-label-bold'
                aria-label='Cancel'
                onClick={() => {
                  props.onChange('right', initialValues.right);
                  props.onChange('left', initialValues.left);
                  props.onChange('top', initialValues.top);
                  props.onChange('bottom', initialValues.bottom);
                  props.onClose();
                }}
              >
                {t['cancel']}
              </button>
              <button
                className='Button primary'
                aria-label='Save'
                onClick={() => props.onClose()}
                disabled={!valid}
              >
                {t['save']}
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
