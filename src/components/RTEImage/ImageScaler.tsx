import * as Slider from '@radix-ui/react-slider';
import * as Popover from '@radix-ui/react-popover';
import type { Translations } from '@ty/Types.ts';
import { useEffect, useRef, useState } from 'react';
import { TextField } from '@radix-ui/themes';

import './RTEImage.css';

interface ImageScalerProps {
  anchorEl: any;
  scale: number;
  i18n: Translations;
  open: boolean;

  onScale(scale: number): void;
  onClose(): void;
}

export const ImageScaler = (props: ImageScalerProps) => {
  const { t } = props.i18n;

  const [initialScale, setInitialScale] = useState(props.scale);

  const virtualRef = useRef<any | null>(null);

  useEffect(() => {
    setInitialScale(props.scale);
  }, []);

  if (props.anchorEl) virtualRef.current = props.anchorEl;

  return (
    <Popover.Root open={props.open}>
      <Popover.Anchor virtualRef={virtualRef} />
      <Popover.Portal>
        <Popover.Content
          className='popover-content rte-image-scaler-content'
          side='top'
        >
          <div className='rte-image-slider-container'>
            <h2>{t['Image Size']}</h2>
            <div className='rte-image-slider-row'>
              <Slider.Root
                className='slider-slider'
                defaultValue={[props.scale]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value) => props.onScale(value[0])}
              >
                <Slider.Track className='slider-track'>
                  <Slider.Range className='slider-range' />
                </Slider.Track>
                <Slider.Thumb className='slider-thumb' />
              </Slider.Root>
              <div className='rte-image-scale-output'>
                <TextField.Root
                  className='rte-image-text-field'
                  size='2'
                  value={props.scale}
                  disabled
                >
                  <TextField.Slot
                    side='right'
                    className='rte-image-text-field-slot'
                  >
                    %{' '}
                  </TextField.Slot>
                </TextField.Root>
              </div>
            </div>
          </div>
          <div className='rte-image-button-container'>
            <button
              className='Button unstyled rte-image-input-cancel-button av-label-bold'
              aria-label='Cancel'
              onClick={() => {
                props.onScale(initialScale);
                props.onClose();
              }}
            >
              {t['cancel']}
            </button>
            <button
              className='Button primary'
              aria-label='Save'
              onClick={() => props.onClose()}
            >
              {t['save']}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
