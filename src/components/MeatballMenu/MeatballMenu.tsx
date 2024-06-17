import type React from 'react'
import type { MeatballMenuItem } from '@ty/ui.ts'
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

import './MeatballMenu.css'

interface Props {
  buttons: MeatballMenuItem[];
  row: { [key: string]: any };
}

export const MeatballMenu: React.FC<Props> = ({ buttons, row }) => {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <DotsHorizontalIcon className='meatball-menu-icon' />
      </Dropdown.Trigger>
      <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
        {buttons.map(but => (
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
    </Dropdown.Root>
  )
}
