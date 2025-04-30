import * as Dialog from '@radix-ui/react-dialog';
import type {
  AnnotationPage,
  AudiovisualFile,
  Translations,
} from '@ty/Types.ts';
import { useState } from 'react';
import { Button } from '@radix-ui/themes';
import * as Switch from '@radix-ui/react-switch';
import './SetModal.css';
import { AvFilePicker } from './AVFilePicker.tsx';

interface Props {
  i18n: Translations;
  set?: AnnotationPage;
  title: string;
  avFileOptions: { value: string; label: string }[];
  speakerCategoryOptions?: { value: string; label: string }[];
  isVideo?: boolean;
  useForCaptions?: boolean;
  speakerCategory?: string;
  canEditAVFile?: boolean;
  avFile?: string;
  onClose: () => void;
  onSave: (
    newName: string,
    avFile: string,
    useForCaptions: boolean | undefined,
    speakerCategory: string | undefined
  ) => Promise<void>;
}

export const SetFormModal: React.FC<Props> = (props) => {
  const [name, setName] = useState(props.set?.set || '');
  const [avFile, setAVFile] = useState(
    props.set?.source_id || props.avFile || ''
  );
  const [useForCaptions, setUseForCaptions] = useState(!!props.useForCaptions);
  const [speakerCategory, setSpeakerCategory] = useState(props.speakerCategory);

  const { t } = props.i18n;

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content set-modal'>
          <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>
          <label>
            {t['Name']}
            <input
              className='text-field'
              type='text'
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </label>
          <label>
            {t['AV File']}
            <AvFilePicker
              options={props.avFileOptions}
              value={avFile}
              onChange={setAVFile}
            />
          </label>
          {props.isVideo && (
            <>
              <label
                htmlFor='use-for-captions'
                className='set-modal-caption-switch'
              >
                {t['Use for Captions']}
                <Switch.Root
                  className='switch-root'
                  id='use-for-captions'
                  checked={useForCaptions}
                  onCheckedChange={setUseForCaptions}
                >
                  <Switch.Thumb className='switch-thumb' />
                </Switch.Root>
              </label>
              {useForCaptions && (
                <label>
                  {t['Tag Category for Speaker (optional)']}
                  <AvFilePicker
                    options={props.speakerCategoryOptions || []}
                    value={props.speakerCategory || ''}
                    onChange={setSpeakerCategory}
                  />
                </label>
              )}
            </>
          )}
          <div className='dialog-buttons'>
            <Dialog.Close asChild>
              <Button
                className='cancel-button unstyled'
                onClick={props.onClose}
              >
                {t['cancel']}
              </Button>
            </Dialog.Close>
            <Button
              className='primary'
              onClick={() =>
                props.onSave(name, avFile, useForCaptions, speakerCategory)
              }
              disabled={!name || !avFile}
            >
              {t['save']}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
