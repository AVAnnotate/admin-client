import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type {
  AnnotationEntry,
  ProjectData,
  Tags,
  Translations,
} from '@ty/Types.ts';
import './TagSelect.css';
import { useFormikContext } from 'formik';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { TagSelectItem } from './TagSelectItem.tsx';
import { X } from 'react-bootstrap-icons';
import { matchTag } from '@lib/events/index.ts';
import { Button } from '@radix-ui/themes';

interface Props {
  i18n: Translations;
  project: ProjectData;
  tags: Tags;
}

export const TagSelect: React.FC<Props> = (props) => {
  const [search, setSearch] = useState('');

  const { setFieldValue, values } = useFormikContext();

  const { t } = props.i18n;

  // create a quick lookup table so we can get tag colors more easily
  const categoryMap = useMemo(() => {
    const obj: { [key: string]: string } = {};

    props.project.project.tags.tagGroups.forEach((tg) => {
      obj[tg.category.toLowerCase()] = tg.color;
    });

    return obj;
  }, [props.project]);

  const tagEls = useMemo(
    () =>
      (values as AnnotationEntry).tags.map((tag, idx) => (
        <div
          className='tag-value'
          key={idx}
          style={{
            backgroundColor:
              categoryMap[
                tag.category.toLowerCase() as keyof typeof categoryMap
              ],
          }}
        >
          {tag.tag}
          <Button className='remove-tag-button'>
            <X
              className='remove-tag-icon'
              onClick={() =>
                setFieldValue(
                  'tags',
                  (values as AnnotationEntry).tags.filter(
                    (tg) => !matchTag(tg, tag)
                  )
                )
              }
            />
          </Button>
        </div>
      )),
    [values, props.tags]
  );

  return (
    <DropdownMenu.Root>
      {/* Beware: these tags use an absolute positioning hack to appear inside
          the dropdown trigger while actually being siblings in the DOM tree. This
          was necessary because the trigger's onClick handler would override the tags'
          onClick handlers due to the DOM structure. With this hack, we can allow the
          user to click on tags inside the triggerwhile also being able to click on
          the trigger itself.*/}
      <div className='tag-value-list'>{tagEls}</div>
      <DropdownMenu.Trigger className='anno-dropdown-trigger'>
        <ChevronDownIcon className='tag-value-x' />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className='anno-dropdown-content' side='top'>
          <input
            className='searchbox'
            onChange={(ev) => setSearch(ev.target.value)}
            placeholder={t['Search']}
            type='text'
            autoFocus
          />
          <div className='anno-list'>
            {props.tags.tagGroups.map((tg, tagGroupIdx) => {
              const groupTags = props.tags.tags.filter((tag) => {
                if (tag.category !== tg.category) return false;

                return search
                  ? tag.tag.toLowerCase().includes(search.toLowerCase())
                  : true;
              });

              if (groupTags.length === 0) {
                return null;
              }

              return (
                <DropdownMenu.Group
                  className='anno-dropdown-group'
                  key={tagGroupIdx}
                >
                  <DropdownMenu.Label>{tg.category}</DropdownMenu.Label>
                  {groupTags.map((tag, tagIdx) => (
                    <TagSelectItem key={tagIdx} tag={tag} tagGroup={tg} />
                  ))}
                </DropdownMenu.Group>
              );
            })}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
