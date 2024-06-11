import type React from 'react'
import './MeatballMenu.css'
import type { MeatballMenuItem } from '@ty/ui.ts'
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';

interface Props {
  buttons: MeatballMenuItem[]
}

export const MeatballMenu: React.FC<Props> = ({ buttons }) => {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <DotsHorizontalIcon className='meatball-menu-icon' />
      </Dropdown.Trigger>
      <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
        {buttons.map(but => (
          <Dropdown.Item className='dropdown-item'>
            {but.icon && <but.icon />}
            {but.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  )
}
