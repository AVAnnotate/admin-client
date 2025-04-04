import type { Translations } from '@ty/Types.ts';
import * as Slider from '@radix-ui/react-slider';
import * as Dialog from '@radix-ui/react-dialog';

import './RTEColumn.css';

interface PaddingControlProps {
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

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Content className='dialog-content rte-padding-content'>
          <Dialog.Title className='dialog-title'>{t['Padding']}</Dialog.Title>
          <div className='rte-padding-container'>
            <div className='rte-padding-slider-row'>
              <label className='rte-padding-label'>{t['Top']}</label>
              <Slider.Root
                className='slider-slider'
                defaultValue={[props.paddingTop]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => props.onChange('top', value[0])}
              >
                <Slider.Track className='slider-track'>
                  <Slider.Range className='slider-range' />
                </Slider.Track>
                <Slider.Thumb className='slider-thumb'>
                  <div className='rte-image-scaler-thumb-tracker'>{`${props.paddingTop}%`}</div>
                </Slider.Thumb>
              </Slider.Root>
            </div>
            <div className='rte-padding-slider-row'>
              <label className='rte-padding-label'>{t['Left']}</label>
              <Slider.Root
                className='slider-slider'
                defaultValue={[props.paddingLeft]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => props.onChange('left', value[0])}
              >
                <Slider.Track className='slider-track'>
                  <Slider.Range className='slider-range' />
                </Slider.Track>
                <Slider.Thumb className='slider-thumb'>
                  <div className='rte-image-scaler-thumb-tracker'>{`${props.paddingLeft}%`}</div>
                </Slider.Thumb>
              </Slider.Root>
            </div>
            <div className='rte-padding-slider-row'>
              <label className='rte-padding-label'>{t['Right']}</label>
              <Slider.Root
                className='slider-slider'
                defaultValue={[props.paddingRight]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => props.onChange('right', value[0])}
              >
                <Slider.Track className='slider-track'>
                  <Slider.Range className='slider-range' />
                </Slider.Track>
                <Slider.Thumb className='slider-thumb'>
                  <div className='rte-image-scaler-thumb-tracker'>{`${props.paddingRight}%`}</div>
                </Slider.Thumb>
              </Slider.Root>
            </div>
            <div className='rte-padding-slider-row'>
              <label className='rte-padding-label'>{t['Bottom']}</label>
              <Slider.Root
                className='slider-slider'
                defaultValue={[props.paddingBottom]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => props.onChange('bottom', value[0])}
              >
                <Slider.Track className='slider-track'>
                  <Slider.Range className='slider-range' />
                </Slider.Track>
                <Slider.Thumb className='slider-thumb'>
                  <div className='rte-image-scaler-thumb-tracker'>{`${props.paddingBottom}%`}</div>
                </Slider.Thumb>
              </Slider.Root>
            </div>
          </div>
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
                props.onChange('right', props.paddingRight);
                props.onChange('left', props.paddingLeft);
                props.onChange('top', props.paddingTop);
                props.onChange('bottom', props.paddingBottom);
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
  );
};
