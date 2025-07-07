import { useState } from 'react';
import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Button } from '@radix-ui/themes';

import './DropdownButton.css';

type DropdownButtonItems = {
  label: string;
  icon?: any | undefined;
  onClick(): void;
};

interface DropdownButtonProps {
  title: string;
  titleIcon: any;

  items: DropdownButtonItems[];
}

export const DropdownButton: React.FC<DropdownButtonProps> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dropdown.Root
        modal={false}
        open={open}
        onOpenChange={(isOpen) => (isOpen ? {} : setOpen(false))}
      >
        <Dropdown.Trigger asChild>
          <Button
            className='dropdown-button primary'
            onClick={() => setOpen(!open)}
          >
            {props.titleIcon}
            {props.title}
            {open ? <TriangleUpIcon /> : <TriangleDownIcon />}
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
            {props.items.map((item) => (
              <Dropdown.Item
                className='dropdown-item'
                onClick={() => item.onClick()}
                key={item.label}
              >
                {item.icon}
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </>
  );
};
