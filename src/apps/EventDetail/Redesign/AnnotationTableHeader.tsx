import { DownloadIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import type { AnnotationEntry, Translations } from '@ty/Types.ts';
import { type ReactElement } from 'react';
import { CaretDownFill, FileEarmarkArrowUp, Plus } from 'react-bootstrap-icons';
import * as Dropdown from '@radix-ui/react-dropdown-menu';

interface Props {
  children?: ReactElement | ReactElement[];
  eventUuid: string;
  displayAnnotations: AnnotationEntry[];
  i18n: Translations;
  onExport: () => void;
  projectSlug: string;
  setSearch: (q: string) => void;
  setShowAnnoCreateModal: (arg: boolean) => void;
  setUuid: string;
}

export const AnnotationTableHeader: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  return (
    <div className='event-detail-table-header'>
      <p>{props.displayAnnotations.length}</p>
      <div className='header-buttons'>
        {props.children}
        {props.setUuid && (
          <Button className='csv-button' onClick={props.onExport} type='button'>
            <DownloadIcon />
            {t['CSV']}
          </Button>
        )}
        <Dropdown.Root modal={false}>
          <Dropdown.Trigger asChild>
            <Button className='primary' type='button'>
              {t['Add annotations']}
              <CaretDownFill color='white' />
            </Button>
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
              <Dropdown.Item
                className='dropdown-item'
                onClick={() => props.setShowAnnoCreateModal(true)}
              >
                <FileEarmarkArrowUp />
                {t['Add single annotation']}
              </Dropdown.Item>
              <Dropdown.Item className='dropdown-item'>
                <a
                  href={`/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/import`}
                >
                  <Plus color='black' />
                  {t['Import from file']}
                </a>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </div>
    </div>
  );
};
