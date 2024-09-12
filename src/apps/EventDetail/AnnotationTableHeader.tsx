import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import type { AnnotationEntry, Translations } from '@ty/Types.ts';
import type { ReactElement } from 'react';
import { FileEarmarkArrowUp } from 'react-bootstrap-icons';

interface Props {
  children?: ReactElement | ReactElement[];
  eventUuid: string;
  displayAnnotations: AnnotationEntry[];
  i18n: Translations;
  onExport: () => void;
  projectSlug: string;
  sets: {
    uuid: string;
    label: string;
  }[];
  setSearch: (q: string) => void;
  setShowAnnoCreateModal: (arg: boolean) => void;
  setUuid: string;
}

export const AnnotationTableHeader: React.FC<Props> = (props) => {
  const { lang, t } = props.i18n;

  return (
    <div className='event-detail-table-header'>
      <p>
        {props.sets.length > 1
          ? props.sets.find((set) => set.uuid === props.setUuid)?.label
          : t['All Annotations']}
        &nbsp;({props.displayAnnotations.length})
      </p>
      <div className='header-buttons'>
        {props.children}
        {props.setUuid && (
          <Button className='csv-button' onClick={props.onExport} type='button'>
            <DownloadIcon />
            {t['CSV']}
          </Button>
        )}
        <Button
          className='primary'
          onClick={() =>
            (window.location.pathname = `/${lang}/projects/${props.projectSlug}/events/${props.eventUuid}/import`)
          }
        >
          <FileEarmarkArrowUp />
          {t['import']}
        </Button>
        <Button
          className='primary'
          onClick={() => props.setShowAnnoCreateModal(true)}
        >
          <PlusIcon />
          {t['Add']}
        </Button>
      </div>
    </div>
  );
};
