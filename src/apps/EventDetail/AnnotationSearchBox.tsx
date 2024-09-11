import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useRef } from 'react';

interface Props {
  setSearch: (q: string) => void;
}

export const AnnotationSearchBox: React.FC<Props> = (props) => {
  const searchDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  return (
    <div className='formic-form-field'>
      <input
        className='searchbox formic-form-text'
        onChange={(ev) => {
          if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
          }

          searchDebounceTimer.current = setTimeout(
            () => props.setSearch(ev.target.value),
            200
          );
        }}
        type='text'
      />
      <MagnifyingGlassIcon />
    </div>
  );
};
