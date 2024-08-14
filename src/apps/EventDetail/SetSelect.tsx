import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import { useMemo } from 'react';

interface Props {
  onChange: (arg: string) => any;
  sets: {
    label: string;
    uuid: string;
  }[];
  value: {
    label: string;
    uuid: string;
  };
}

const truncate = (str: string) =>
  str.length > 76 ? `${str.substring(0, 76)}...` : str;

export const SetSelect: React.FC<Props> = (props) => {
  const truncatedSets = useMemo(() => {
    return props.sets.map((set) => ({
      label: truncate(set.label),
      uuid: set.uuid,
    }));
  }, [props.sets]);

  return (
    <Select.Root onValueChange={props.onChange} value={props.value.uuid}>
      <Select.Trigger className='select-trigger'>
        <Select.Value>{truncate(props.value.label)}</Select.Value>
        <Select.Icon className='select-icon'>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className='select-content' position='popper'>
          <Select.Viewport className='select-viewport'>
            {truncatedSets.map((set) => (
              <Select.Item
                className='select-item'
                key={set.uuid}
                value={set.uuid}
              >
                <p>{set.label}</p>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
