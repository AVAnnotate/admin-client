import { DeleteModal } from '@components/DeleteModal/index.ts';
import type { AnnotationPage, Translations } from '@ty/Types.ts';
import { useMemo } from 'react';

interface Props {
  baseUrl: string;
  i18n: Translations;
  onAfterSave: () => void;
  onCancel: () => void;
  set: AnnotationPage & { uuid: string };
}

export const DeleteSetModal: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  // get a count of the number of annotations that will be deleted
  // alongside this set.
  const warningText = useMemo(() => {
    const count = props.set.annotations.length;

    if (count === 0) {
      return undefined;
    } else {
      return (
        <p className='annotation-note'>
          <span className='annotation-count'>{count}</span>
          &nbsp;
          {t['associated annotations will also be deleted.']}
        </p>
      );
    }
  }, [props.set]);

  const deleteSet = async () => {
    await fetch(props.baseUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    props.onAfterSave();
  };

  return (
    <DeleteModal
      additionalText={warningText}
      className='delete-set-modal'
      name={t['Set']}
      i18n={props.i18n}
      onCancel={props.onCancel}
      onDelete={deleteSet}
    />
  );
};
