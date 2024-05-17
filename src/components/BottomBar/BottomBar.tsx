import { AccountActions } from '@components/AccountActions/index.ts';
import type { MyProfile, Translations } from '@ty/Types.ts';

import './BottomBar.css';

interface BottomBarProps {
  children: any;
}

export const BottomBar = (props: BottomBarProps) => {
  return (
    <div className='bottom-bar-container'>
      <footer>{props.children}</footer>
    </div>
  );
};
