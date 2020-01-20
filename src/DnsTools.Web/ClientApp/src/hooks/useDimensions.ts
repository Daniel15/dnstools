import {useCallback, useLayoutEffect, useRef, useState} from 'react';

export type Dimensions = Readonly<{
  absoluteTop: number;
  absoluteLeft: number;
  height: number;
  width: number;
}>;

/**
 * Records the position and dimensions of an element.
 */
export default function useDimensions() {
  const [dimensions, setDimensions] = useState<Dimensions>({
    absoluteLeft: 0,
    absoluteTop: 0,
    height: 0,
    width: 0,
  });
  const [node, setNode] = useState<HTMLElement | null>(null);
  const rafID = useRef<number | null>(null);
  const ref = useCallback(node => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    function update() {
      if (!node) {
        return;
      }

      if (rafID.current) {
        window.cancelAnimationFrame(rafID.current);
      }

      rafID.current = window.requestAnimationFrame(() => {
        rafID.current = null;
        const rect = node.getBoundingClientRect();
        const scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        setDimensions({
          absoluteTop: rect.top + scrollTop,
          absoluteLeft: rect.left + scrollLeft,
          height: rect.height,
          width: rect.width,
        });
      });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [node]);

  return {ref, dimensions};
}
