import {useRef, useState, useCallback} from 'react';

type Return = Readonly<{
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMouseOver: boolean;
}>;

const DELAY = 50;

/**
 * Handles mouseenter and mouseleave events. Mouseleave is not recorded until a specific
 * delay, to handle the case where the mouse is moving out and then quickly back onto the
 * element, or the mouse is moving between some related elements.
 */
export default function useMouseOver(): Return {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const mouseLeaveTimer = useRef<number | null>(null);

  function clearTimeout() {
    if (mouseLeaveTimer.current) {
      window.clearTimeout(mouseLeaveTimer.current);
      mouseLeaveTimer.current = null;
    }
  }

  const onMouseEnter = useCallback(() => {
    clearTimeout();
    setIsMouseOver(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    clearTimeout();
    mouseLeaveTimer.current = window.setTimeout(
      () => setIsMouseOver(false),
      DELAY,
    );
  }, []);

  return {onMouseEnter, onMouseLeave, isMouseOver};
}
