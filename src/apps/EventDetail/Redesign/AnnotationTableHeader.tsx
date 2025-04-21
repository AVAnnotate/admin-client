import { DownloadIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import type { AnnotationEntry, Translations } from '@ty/Types.ts';
import { CaretDownFill, FileEarmarkArrowUp, Plus } from 'react-bootstrap-icons';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnnotationSearchBox } from './AnnotationSearchBox.tsx';

interface Props {
  children?: any;
  eventUuid: string;
  displayAnnotations: AnnotationEntry[];
  fileType: 'Audio' | 'Video';
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
      {props.fileType === 'Video' && (
        <h2 className='video-annotations-header'>{t['Annotations']}</h2>
      )}
      {props.children}
      <div className='header-buttons'>
        <AnnotationSearchBox setSearch={props.setSearch} />
        <div className='buttons'>
          {props.setUuid && (
            <Button
              className='csv-button'
              onClick={props.onExport}
              type='button'
            >
              <DownloadIcon />
              {t['CSV']}
            </Button>
          )}
          <Dropdown.Root modal={false}>
            <Dropdown.Trigger asChild>
              <Button className='primary' type='button'>
                {props.fileType === 'Audio' ? t['Add annotations'] : t['Add']}
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
    </div>
  );
};
