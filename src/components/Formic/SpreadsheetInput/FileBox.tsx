import { FileX } from '@phosphor-icons/react/FileX';
import { ArrowsClockwise } from '@phosphor-icons/react/ArrowsClockwise';
import { Trash } from '@phosphor-icons/react/Trash';
import type { Translations } from '@ty/Types.ts';

interface FileBoxProps {
  file: File;
  i18n: Translations;
  onClick: () => void;
}

export const FileBox = (props: FileBoxProps) => {
  const { t } = props.i18n;
  return (
    <div className='file-box-container' onClick={props.onClick}>
      <div className='file-box-left'>
        <FileX size={32} />
        <div className='file-box-text-container'>
          <div className='av-label file-box-name'>{props.file.name}</div>

          <div className='av-caption file-box-size'>{`${Math.round(
            props.file.size / 1000
          )} KB`}</div>
        </div>
      </div>
      <div className='file-box-icon-container'>
        <div className='file-box-replace'>
          <ArrowsClockwise size={16} />
          {t['Replace']}
        </div>
        <Trash size={20} />
      </div>
    </div>
  );
};
