import * as Ariakit from '@ariakit/react';
import { useEffect, useState, type ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import '@themes/default/index.css';
import './SearchUsers.css';
import type { ProviderUser, Translations } from '@ty/Types.ts';
import { X } from '@phosphor-icons/react/dist/icons/X';
import { Avatar } from '@components/Avatar/index.ts';

interface SearchUsersProps {
  buttonText: string;

  i18n: Translations;

  onSelect(user: ProviderUser): void;
}

export const SearchUsers = (props: SearchUsersProps) => {
  const { t } = props.i18n;

  const [search, setSearch] = useState('');
  const [list, setList] = useState<any[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: any) => {
    setSearch(e.target.value as string);
  };

  const handleSave = () => {
    const find = list.find((u) => u.login === value);
    if (find) {
      fetch(`/api/users/${find.login}`).then((resp) => {
        resp.json().then((data) => {
          props.onSelect({
            avatar_url: data.avatar_url,
            login_name: data.login,
            name: data.name,
            admin: false,
          });
        });
      });
    }
  };

  useEffect(() => {
    if (search && search.length > 0) {
      setLoading(true);
      fetch(`/api/users/search/${search}`).then((resp) => {
        if (resp.ok) {
          resp.json().then((data) =>
            setList(
              data.sort((a: any, b: any) => {
                const key = search.toLowerCase();
                const isGoodMatchNameA = a.name
                  ? a.name.toLowerCase().startsWith(key)
                  : false;
                const isGoodMatchNameB = b.name
                  ? b.name.toLowerCase().startsWith(key)
                  : false;

                const isGoodMatchLoginA = a.login.toLowerCase().startsWith(key);
                const isGoodMatchLoginB = b.login.toLowerCase().startsWith(key);

                if (isGoodMatchNameA ^ isGoodMatchNameB) {
                  // XOR
                  return isGoodMatchNameA ? -1 : 1;
                }

                if (isGoodMatchLoginA ^ isGoodMatchLoginB) {
                  // XOR
                  return isGoodMatchLoginA ? -1 : 1;
                }

                return a.login.localeCompare(b.login);
              })
            )
          );
          setLoading(false);
        }
      });
    }
  }, [search]);
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='dialog-button primary'>{props.buttonText}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Search Users']}
          </Dialog.Title>
          <Dialog.Description className='dialog-description'>
            <div>{t['Start typing to search for users.']}</div>
          </Dialog.Description>
          <Ariakit.ComboboxProvider setValue={(val) => setValue(val)}>
            <div className='search-users-spinner-container'>
              {loading ? (
                <span className='search-users-spinner-loader' />
              ) : (
                <span className='search-users-spinner-spacer'></span>
              )}
            </div>
            <Ariakit.ComboboxLabel className='search-users-label'>
              {t['Search']}
            </Ariakit.ComboboxLabel>
            <Ariakit.Combobox
              className='search-users-combobox'
              onChange={handleSearchChange}
            />
            <Ariakit.ComboboxPopover gutter={4} sameWidth className='popover'>
              {list &&
                list.length > 0 &&
                list.map((u) => {
                  return (
                    <Ariakit.ComboboxItem
                      className='search-users-combobox-item'
                      value={u.login}
                      key={u.login}
                    >
                      <div className='search-users-item-container'>
                        <Avatar avatar={u.avatar_url} />
                        <div className='search-users-item-name-container '>
                          <div className='av-label-bold'>{u.login}</div>
                          <div className='av-body-small'>{u.name}</div>
                        </div>
                      </div>
                    </Ariakit.ComboboxItem>
                  );
                })}
            </Ariakit.ComboboxPopover>
          </Ariakit.ComboboxProvider>
          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close asChild>
              <button
                className='search-users-button'
                disabled={value.length === 0}
                onClick={handleSave}
              >
                {t['save']}
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className='dialog-close-button' aria-label='Close'>
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
