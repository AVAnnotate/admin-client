import { AccountActions } from '@components/AccountActions/index.ts';
import type { MyProfile, Translations } from '@ty/Types.ts';

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
        <a href={`/${props.i18n.lang}/projects`}>
          <div className='top-bar-branding'>
            <img height={22} src='/avannotate_logo.svg' alt='AVAnnotate' />
          </div>
        </a>
        <div className='top-bar-actions'>
          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </header>
    </div>
  );
};
