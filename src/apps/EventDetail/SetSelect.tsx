import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Select from '@radix-ui/react-select';
import { useMemo } from 'react';
import SetManagementDropdown from './SetManagementDropdown.tsx';
import type { Translations } from '@ty/Types.ts';

type Set = {
  title: string;
  uuid: string;
};

interface Props {
  editUrl: string;
  i18n: Translations;
  onChange: (set: Set) => any;
  sets: Set[];
  setShowAddSetModal: (arg: boolean) => void;
  value: Set;
}

const truncate = (str: string) =>
  str.length > 76 ? `${str.substring(0, 76)}...` : str;

export const SetSelect: React.FC<Props> = (props) => {
  const truncatedSets = useMemo(() => {
    return props.sets.map((set) => ({
      title: truncate(set.title),
      uuid: set.uuid,
    }));
  }, [props.sets]);

  const onChange = (uuid: string) => {
    const match = props.sets.find((s) => s.uuid === uuid);
    if (match) {
      props.onChange(match);
    }
  };

  return (
    <div className='set-select-row'>
      <Select.Root onValueChange={onChange} value={props.value.uuid}>
        <Select.Trigger className='select-trigger'>
          <Select.Value>{truncate(props.value.title)}</Select.Value>
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
                  <p>{set.title}</p>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <SetManagementDropdown
        setShowAddSetModal={props.setShowAddSetModal}
        editUrl={props.editUrl}
        i18n={props.i18n}
      />
    </div>
  );
};
