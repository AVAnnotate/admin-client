import * as Slider from '@radix-ui/react-slider';
import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from '@ty/Types.ts';

import './RTEImage.css';

interface ImageScalerProps {
  scale: number;
  i18n: Translations;
  open: boolean;

  onScale(scale: number): void;
  onClose(): void;
}

export const ImageScaler = (props: ImageScalerProps) => {
  const { t } = props.i18n;

  return (
    <>
      <Dialog.Root open={props.open}>
        <Dialog.Portal>
          {/* <Dialog.Overlay className='dialog-overlay' /> */}
          <Dialog.Content className='dialog-content rte-image-scaler-content'>
            <Dialog.Title className='dialog-title'>
              {t['Scale Image']}
            </Dialog.Title>
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
              <Slider.Thumb className='slider-thumb'>
                <div className='rte-image-scaler-thumb-tracker'>{`${props.scale}%`}</div>
              </Slider.Thumb>
            </Slider.Root>
            <div
              style={{
                display: 'flex',
                marginTop: 25,
                justifyContent: 'space-between',
              }}
            >
              <button
                className='Button outline'
                aria-label='Cancel'
                onClick={() => {
                  props.onScale(props.scale);
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
