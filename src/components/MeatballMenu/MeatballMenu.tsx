import type React from 'react';
import type { MeatballMenuItem } from '@ty/ui.ts';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical } from '@phosphor-icons/react/DotsThreeVertical';
import { ChevronRightIcon } from '@radix-ui/react-icons';

import './MeatballMenu.css';
import { useMemo } from 'react';

interface Props {
  buttons: MeatballMenuItem[];
  icon?: any;
  row: { [key: string]: any };
}

export const MeatballMenu: React.FC<Props> = ({ buttons, icon, row }) => {
  const IconComponent = useMemo(() => icon || DotsThreeVertical, [icon]);

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <div className='meatball-menu-icon'>
          <IconComponent size={16} />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className='dropdown-content meatball-dropdown-content'>
          {buttons
            .filter((but) =>
              but.displayCondition ? but.displayCondition(row) : true
            )
            .map((but) => {
              if (but.hasSubmenus) {
                return (
                  <Dropdown.Sub key={but.label}>
                    <Dropdown.SubTrigger className='dropdown-subtrigger'>
                      {but.icon && <but.icon />}
                      {but.label}
                      <div>
                        <ChevronRightIcon />
                      </div>
                    </Dropdown.SubTrigger>
                    <Dropdown.Portal>
                      <Dropdown.SubContent className='dropdown-subcontent'>
                        {but.children?.map((child) => (
                          <Dropdown.Item
                            className='dropdown-item'
                            key={child.label}
                            onClick={async () => await child.onClick!(row)}
                          >
                            {child.icon && <child.icon />}
                            {child.label}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.SubContent>
                    </Dropdown.Portal>
                  </Dropdown.Sub>
                );
              } else {
                return (
                  <Dropdown.Item
                    className='dropdown-item'
                    key={but.label}
                    onClick={async () => await but.onClick!(row)}
                  >
                    {but.icon && <but.icon />}
                    {but.label}
                  </Dropdown.Item>
                );
              }
            })}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
