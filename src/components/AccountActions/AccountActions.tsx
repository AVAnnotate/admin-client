import { useState, type ReactNode } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { SignOut, GithubLogo, CaretDown, CaretUp } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { MyProfile, Translations } from '@ty/Types';

import './AccountActions.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface AccountProps {
  align?: 'center' | 'end' | 'start';

  alignOffset?: number;

  children?: ReactNode;

  i18n: Translations;

  profile: MyProfile;

  sideOffset?: number;
}

export const AccountActions = (props: AccountProps) => {
  const [open, setOpen] = useState(false);

  const { profile } = props;

  const { lang, t } = props.i18n;

  const goto = (url: string) => () => (window.location.href = url);

  const align = props.align || 'end';

  const alignOffset = props.alignOffset || -10;

  const sideOffset = props.sideOffset || 8;

  const handleOpenChanged = (open: boolean) => {
    setOpen(open);
  };

  return (
    <Root onOpenChange={handleOpenChanged}>
      <Trigger asChild>
        {props.children ? (
          props.children
        ) : (
          <div className='unstyled account-actions-trigger'>
            <Avatar
              id={profile.name}
              name={profile.gitHubName}
              avatar={profile.avatarURL}
            />
            <span className='profile-name'>
              {props.profile.gitHubName
                ? props.profile.gitHubName
                : props.profile.name}
            </span>
            {open ? <CaretUp /> : <CaretDown />}
          </div>
        )}
      </Trigger>

      <Portal>
        <Content
          className='dropdown-content'
          align={align}
          alignOffset={alignOffset}
          sideOffset={sideOffset}
        >
          {(Boolean(profile.gitHubName) || Boolean(profile.name)) && (
            <section className='account-actions-meta'>
              {profile.gitHubName && profile.name ? (
                <>
                  <div className='github-nickname'>
                    <GithubLogo />
                    <h1>{profile.gitHubName}</h1>
                  </div>
                  <h2>{profile.name}</h2>
                </>
              ) : profile.gitHubName ? (
                <h1>{profile.gitHubName}</h1>
              ) : (
                <h1>{profile.name}</h1>
              )}
            </section>
          )}

          <section>
            <Item
              className='dropdown-item'
              onSelect={goto(`/${lang}/sign-out`)}
            >
              <SignOut size={16} />
              <a href={`/${lang}/sign-out`}>{t['Sign out']}</a>
            </Item>
          </section>
        </Content>
      </Portal>
    </Root>
  );
};
