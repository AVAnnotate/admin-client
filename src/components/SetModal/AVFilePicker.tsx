import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';

interface Props {
  options: { value: string; label: string }[];
  onChange: (arg: string) => any;
  value: string;
}

export const AvFilePicker: React.FC<Props> = (props) => {
  return (
    <Select.Root onValueChange={props.onChange} value={props.value}>
      <Select.Trigger className='select-trigger'>
        <Select.Value className='select-value' />
        <Select.Icon className='select-icon'>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className='select-content' position='popper'>
          <Select.Viewport className='select-viewport'>
            {props.options.map((option, idx) => (
              <Select.Item
                className='select-item'
                key={option.value}
                value={option.value}
              >
                <Select.ItemText className='select-item-text'>
                  {option.label}
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
