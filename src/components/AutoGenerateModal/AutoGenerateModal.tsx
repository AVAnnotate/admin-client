import type { ProjectData, Translations } from '@ty/Types.ts';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Button } from '@radix-ui/themes';
import './AutoGenerateModal.css';
import { useEffect, useMemo, useState } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';

export type AutoGenerateOptions = {
  uuid: string | undefined;
  type: 'home' | 'event';
  label?: string;
  generate: boolean;
};

interface AutoGenerateModalProps {
  project: ProjectData;
  i18n: Translations;

  open: boolean;

  onClose(): void;
  onUpdateAutoGenerate(options: AutoGenerateOptions[]): void;
}

export const AutoGenerateModal = (props: AutoGenerateModalProps) => {
  const { t } = props.i18n;

  const [pages, setPages] = useState<AutoGenerateOptions[]>([]);

  useEffect(() => {
    if (props.project.pages) {
      const res: AutoGenerateOptions[] = [];

      let customHome = false;
      // home page?
      Object.keys(props.project.pages).forEach((uuid) => {
        const page = props.project.pages[uuid];
        if (page.autogenerate.type === 'home') {
          if (page.autogenerate.enabled) {
            res.push({
              uuid: uuid,
              type: 'home',
              generate: true,
              label: t['Home'],
            });
          } else {
            customHome = true;
          }
        }
      });

      // Did we find a home page
      if (res.length === 0 && !customHome) {
        res.push({
          uuid: undefined,
          type: 'home',
          generate: false,
          label: t['Home'],
        });
      }

      // Now check events
      Object.keys(props.project.events).forEach((uuid) => {
        const event = props.project.events[uuid];
        // Do we have a auto-gen page for this?
        const foundPage = Object.values(props.project.pages).find(
          (page) =>
            page.autogenerate.enabled && page.autogenerate.type_id === uuid
        );
        res.push({
          uuid: uuid,
          type: 'event',
          generate: !!foundPage,
          label: event.label,
        });
      });

      setPages(res);
    }
  }, [props.project]);

  const allChecked = useMemo(() => {
    let all = true;
    pages.forEach((p) => {
      if (!p.generate) {
        all = false;
      }
    });

    return all;
  }, [pages]);

  const handleToggleCheck = (uuid: string | undefined, type: string) => {
    const res = [...pages];

    if (type === 'home') {
      let home = res.find((p) => p.type === 'home');
      if (home) {
        home.generate = !home.generate;
      }
    } else {
      let page = res.find((p) => p.uuid === uuid);
      if (page) {
        page.generate = !page.generate;
      }
    }

    setPages(res);
  };

  const handleToggleSelectAll = () => {
    const res = [...pages];
    res.forEach((page) => {
      page.generate = !page.generate;
    });

    setPages(res);
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Add Auto-Generated Page']}
          </Dialog.Title>
          <Dialog.Description className='dialog-description'>
            {t['_autogenerate_modal_description_']}
          </Dialog.Description>
          <div className='auto-gen-modal-content'>
            <div className='av-label-bold'>
              {t['Select the page(s) you would like to auto-generate']}
            </div>

            <div className='auto-gen-modal-checkbox'>
              <Checkbox.Root
                className='checkbox-root'
                checked={allChecked}
                onCheckedChange={() => handleToggleSelectAll()}
              >
                <Checkbox.Indicator className='checkbox-indicator'>
                  <CheckIcon />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label className='av-label'>{t['Select All']}</label>
            </div>
            <div className='auto-gen-modal-divider' />
            <div className='auto-gen-modal-checkbox-panel'>
              {pages.map((page) => {
                return (
                  <div
                    className='auto-gen-modal-checkbox'
                    key={page.label || page.uuid}
                  >
                    <Checkbox.Root
                      className='checkbox-root'
                      checked={page.generate}
                      onCheckedChange={() =>
                        handleToggleCheck(page.uuid, page.type)
                      }
                    >
                      <Checkbox.Indicator className='checkbox-indicator'>
                        <CheckIcon />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label className='av-label'>
                      {page.type === 'home' ? t['Home'] : page.label}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className='auto-gen-modal-actions'>
              <Button
                className='unstyled auto-gen-modal-button av-label-bold'
                type='button'
                onClick={() => props.onClose()}
              >
                {t['cancel']}
              </Button>
              <Button
                className='primary auto-gen-modal-button av-label-bold'
                onClick={() => props.onUpdateAutoGenerate(pages)}
              >
                {t['Add']}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
