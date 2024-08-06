import * as Select from '@radix-ui/react-select';
import type { Tag, Tags } from '@ty/Types.ts';
import './TagSelect.css';
import { useFormikContext } from 'formik';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface Props {
  tags: Tags;
}

export const TagSelect: React.FC<Props> = (props) => {
  const { setFieldValue, values } = useFormikContext();

  console.log(values);

  return (
    <Select.Root onValueChange={(data) => console.log(data)}>
      <Select.Trigger className='select-trigger'>
        {/* todo: render values */}
        <Select.Value asChild>
          <div>
            {(values as any).tags &&
              (values as any).tags.map((t) => <span>{t.tag}</span>)}
          </div>
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className='select-content' position='popper'>
          <Select.Viewport className='select-viewport'>
            {props.tags.tagGroups.map((tg) => (
              <Select.Group className='select-group' title={tg.category}>
                {props.tags.tags
                  .filter((tag) => tag.category === tg.category)
                  .map((tag) => (
                    <Select.Item
                      className='select-item'
                      key={tag.tag}
                      value={tag.tag}
                    >
                      {tag.tag}
                    </Select.Item>
                  ))}
              </Select.Group>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
