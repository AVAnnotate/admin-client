import type React from 'react';
import type { MeatballMenuItem } from '@ty/ui.ts';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical } from '@phosphor-icons/react/DotsThreeVertical';

import './MeatballMenu.css';

interface Props {
  buttons: MeatballMenuItem[];
  row: { [key: string]: any };
}

export const MeatballMenu: React.FC<Props> = ({ buttons, row }) => {
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <DotsThreeVertical className='meatball-menu-icon' />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
          {buttons
            .filter((but) =>
              but.displayCondition ? but.displayCondition(row) : true
            )
            .map((but) => (
              <Dropdown.Item
                className='dropdown-item'
                key={but.label}
                onClick={async () => await but.onClick!(row)}
              >
                {but.icon && <but.icon />}
                {but.label}
              </Dropdown.Item>
            ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
