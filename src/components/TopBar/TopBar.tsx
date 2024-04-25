import { AccountActions } from '@components/AccountActions';
import type { MyProfile, Translations } from 'src/Types';

import './TopBar.css';

interface TopBarProps {
  i18n: Translations;

  me: MyProfile;
  onError(error: string): void;
}

export const TopBar = (props: TopBarProps) => {
  return (
    <div className='top-bar-container'>
      <header>
        <div className='top-bar-branding'>
          <span className='top-bar-highlight'>AV</span>
          <span className='top-bar-title'>Annotate</span>
        </div>
        <div className='top-bar-actions'>
          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </header>
    </div>
  );
};
