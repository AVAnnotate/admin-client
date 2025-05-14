import { DotsThree } from '@phosphor-icons/react/dist/icons/DotsThree';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Button } from '@radix-ui/themes';
import type { Translations } from '@ty/Types.ts';
import { Gear, Plus } from 'react-bootstrap-icons';

interface Props {
  i18n: Translations;
  setShowAddSetModal: (arg: boolean) => void;
  editUrl: string;
}

const SetManagementDropdown: React.FC<Props> = (props) => {
  const { t } = props.i18n;

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <Button
          className='unstyled meatball-menu-icon annotation-tab-meatball-button'
          type='button'
        >
          <DotsThree size={16} color='black' />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
          <Dropdown.Item
            className='dropdown-item'
            onClick={() => props.setShowAddSetModal(true)}
          >
            <Plus />
            {t['Add']}
          </Dropdown.Item>
          <Dropdown.Item className='dropdown-item'>
            <a href={props.editUrl}>
              <Gear />
              {t['Edit']}
            </a>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default SetManagementDropdown;
