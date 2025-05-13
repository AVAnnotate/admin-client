import type { ProjectData, Translations } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Button } from '@radix-ui/themes';
import './PublishModal.css';
import { useEffect, useState } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';

export type PublishOptions = {
  publishPages: boolean;
  publishStatic: boolean;
};

interface PublishModalProps {
  i18n: Translations;
  project: ProjectData;
  open: boolean;

  onClose(): void;
  onPublishSite(options: PublishOptions): void;
}

export const PublishModal = (props: PublishModalProps) => {
  const { t } = props.i18n;

  const [options, setOptions] = useState<PublishOptions>({
    publishPages: false,
    publishStatic: false,
  });

  useEffect(() => {
    setOptions({
      publishPages: !!props.project.publish.publish_pages_app,
      publishStatic: !!props.project.publish.publish_static_site,
    });
  }, [props.project]);

  const handleToggleCheck = (type: string) => {
    const res = { ...options };

    if (type === 'pages') {
      res.publishPages = !res.publishPages;
    } else {
      res.publishStatic = !res.publishStatic;
    }

    setOptions(res);
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>{t['Publish']}</Dialog.Title>
          <Dialog.Description className='dialog-description'>
            {t['_publish_site_description_']}
          </Dialog.Description>
          <div className='publish-modal-content'>
            <div className='av-label-bold'>
              {t['Select type(s) of site you would like to publish']}
            </div>

            <div className='publish-modal-checkbox-panel'>
              <div className='publish-modal-checkbox' key='pages'>
                <Checkbox.Root
                  className='checkbox-root'
                  checked={options.publishPages}
                  onCheckedChange={() => handleToggleCheck('pages')}
                >
                  <Checkbox.Indicator className='checkbox-indicator'>
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className='av-label'>{t['GitHub Pages Site']}</label>
              </div>
              <div className='publish-modal-checkbox' key='static'>
                <Checkbox.Root
                  className='checkbox-root'
                  checked={options.publishStatic}
                  onCheckedChange={() => handleToggleCheck('static')}
                >
                  <Checkbox.Indicator className='checkbox-indicator'>
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className='av-label'>{t['Static Site']}</label>
              </div>
            </div>
            <div className='publish-modal-actions'>
              <Button
                className='unstyled publish-modal-button av-label-bold'
                type='button'
                onClick={() => props.onClose()}
              >
                {t['cancel']}
              </Button>
              <Button
                className='primary publish-modal-button av-label-bold'
                onClick={() => props.onPublishSite(options)}
              >
                {t['Publish']}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
