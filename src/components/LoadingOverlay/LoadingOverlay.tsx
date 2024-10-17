import { Spinner } from '@components/Spinner/index.ts';

import './LoadingOverlay.css';

/**
 * A full-screen loading indicator that makes the content underneath inert.
 */

interface LoadingOverlayProps {
  text?: string;
}
export const LoadingOverlay = (props: LoadingOverlayProps) => {
  return (
    <div className='loading-overlay'>
      <Spinner />
      <h1>{props.text}</h1>
    </div>
  );
};
