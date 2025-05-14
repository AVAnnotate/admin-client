import { useEffect, useCallback } from 'react';

/**
 * This hook watches window resize events and updates the passed component
 * so, starting from the Y coordinate where it begins, it always fills the
 * rest of the page's height.
 */
const useExpandHeight = (
  ref: React.RefObject<HTMLElement>,
  condition?: boolean
) => {
  const updateHeight = useCallback(() => {
    if (ref.current && (typeof condition === 'undefined' || condition)) {
      const { top } = ref.current.getBoundingClientRect();
      // there's still a tiny bit of scroll if I don't subtract 12 extra pixels.
      // possibly related to a box-sizing CSS property somewhere
      const newHeight = window.innerHeight - top - 12;
      ref.current.style.maxHeight = `${newHeight}px`;
    }
  }, [ref]);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [updateHeight]);
};

export default useExpandHeight;
