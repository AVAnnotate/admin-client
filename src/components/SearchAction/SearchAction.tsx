import { useEffect, useState } from 'react';
import type { Translations } from '@ty/Types.ts';
import { TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

import './SearchAction.css';

interface SearchActionProps {
  i18n: Translations;

  onChangeSearch(value: string): void;
}

export const SearchAction = (props: SearchActionProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    props.onChangeSearch(value);
  }, [value]);

  return (
    <div className='search-container'>
      <TextField.Root
        value={value}
        onChange={(e) => setValue(e.target.value)}
        size='3'
      >
        <TextField.Slot side='right'>
          <MagnifyingGlassIcon height='16' width='16' />
        </TextField.Slot>
      </TextField.Root>
    </div>
  );
};
