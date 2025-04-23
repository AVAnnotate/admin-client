import * as Tooltip from '@radix-ui/react-tooltip';

import './ToolbarTooltip.css';

export const ToolbarTooltip = (props: { children: any; content: string }) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{props.children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className='toolbar-tooltip-content'>
            {props.content}
            <Tooltip.Arrow className='toolbar-tooltip-arrow' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
