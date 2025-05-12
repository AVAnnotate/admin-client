import type { Translations } from '@ty/Types.ts';
import { ImportTagsDialog } from './ImportTagsDialog/ImportTagsDialog.tsx';

import './Tags.css';

export interface NoTagsProps {
  i18n: Translations;

  onImportTags(data: any[], headerMap: { [key: string]: number }): void;

  onAddTagGroup(): void;
}

export const NoTags = (props: NoTagsProps) => {
  const { t } = props.i18n;

  return (
    <div className='tags-no-tags-container'>
      <div className='tags-no-tags-description'>
        {t['No tags have been added']}
      </div>
      <div className='tags-no-tags-buttons'>
        <ImportTagsDialog i18n={props.i18n} onSave={props.onImportTags} />
        <button type='button' className='outline' onClick={props.onAddTagGroup}>
          {t['Add']}
        </button>
      </div>
    </div>
  );
};
