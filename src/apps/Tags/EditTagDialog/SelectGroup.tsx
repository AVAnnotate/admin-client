import * as Select from '@radix-ui/react-select';
import type { Translations } from '@ty/Types.ts';

export interface SelectGroupProps {
  i18n: Translations;
  group: string | undefined;
  groups: string[];
  onChange(group: string): void;
  disabled: boolean;
}

export const SelectGroup = (props: SelectGroupProps) => {
  const { t } = props.i18n;

  return (
    <Select.Root
      value={props.group}
      onValueChange={props.onChange}
      disabled={props.disabled}
    >
      <Select.Trigger className='select-trigger'>
        <Select.Value aria-label={props.group} className='select-value'>
          {props.group === '_uncategorized_' ? t['Uncategorized'] : props.group}
        </Select.Value>
        <Select.Icon className='select-icon' />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className='select-content'>
          <Select.Viewport className='select-viewport'>
            {props.groups.map((g) => (
              <Select.Item className='select-item' value={g} key={g}>
                <Select.ItemText className='select-item-text'>
                  {g === '_uncategorized_' ? t['Uncategorized'] : g}
                </Select.ItemText>
                <Select.ItemIndicator className='select-indicator'></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
