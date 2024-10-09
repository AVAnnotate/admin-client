import { useStore } from '@nanostores/react';
import { avaError } from '../../nanos/error.ts';
import { Warning } from '@phosphor-icons/react/Warning';

import './BottomBar.css';

interface BottomBarProps {
  children: any;
}

export const BottomBar = (props: BottomBarProps) => {
  const error = useStore(avaError);

  return (
    <div className='bottom-bar-container'>
      <footer className='bottom-bar'>
        {' '}
        {error ? (
          <div className='bottom-bar-error'>
            <Warning color='red' size={32} />
            <div className='av-label'>{error}</div>
          </div>
        ) : (
          <div className='bottom-bar-error-spacer' />
        )}
        {props.children}
      </footer>
    </div>
  );
};
