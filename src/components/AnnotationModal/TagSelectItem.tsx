import type { AnnotationEntry, Tag, TagGroup } from '@ty/Types.ts';
import { useFormikContext } from 'formik';
import { Button } from '@radix-ui/themes';
import { useCallback, useMemo } from 'react';
import { CheckIcon } from '@radix-ui/react-icons';
import { matchTag } from '@lib/events/index.ts';

interface Props {
  tag: Tag;
  tagGroup: TagGroup;
}

export const TagSelectItem: React.FC<Props> = (props) => {
  const { setFieldValue, values } = useFormikContext();

  const isSelected = useMemo(() => {
    return !!(values as AnnotationEntry).tags.find(
      (tagValue) =>
        tagValue.tag === props.tag.tag &&
        tagValue.category.toLowerCase() ===
          props.tagGroup.category.toLowerCase()
    );
  }, [props.tag, props.tagGroup, values]);

  const onClick = useCallback(() => {
    if (isSelected) {
      setFieldValue(
        'tags',
        (values as AnnotationEntry).tags.filter(
          (tg) => !matchTag(tg, props.tag)
        )
      );
    } else {
      setFieldValue('tags', [...(values as AnnotationEntry).tags, props.tag]);
    }
  }, [props.tag, isSelected, values]);

  return (
    <Button
      className={`tag-dropdown-item ${isSelected ? 'selected-tag' : ''}`}
      style={{
        backgroundColor: props.tagGroup.color,
      }}
      onClick={onClick}
      type='button'
    >
      {isSelected && <CheckIcon className='selected-tag-check' />}
      {props.tag.tag}
    </Button>
  );
};
