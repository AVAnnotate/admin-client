import { formatTimestamp } from '@lib/events/index.ts';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import type { Event } from '@ty/Types.ts';

interface Props {
  event: Event;
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
            {Object.keys(props.event.audiovisual_files).map((uuid, idx) => (
              <Select.Item className='select-item' key={uuid} value={uuid}>
                <Select.ItemText className='select-item-text'>
                  {idx + 1}.&nbsp;
                  {props.event.audiovisual_files[uuid].label}&nbsp; (
                  {formatTimestamp(
                    props.event.audiovisual_files[uuid].duration,
                    false
                  )}
                  )
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
