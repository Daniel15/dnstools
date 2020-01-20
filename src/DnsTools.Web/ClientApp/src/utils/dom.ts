export type Dimensions = Readonly<{
  absoluteLeft: number;
  absoluteTop: number;
  height: number;
  width: number;
}>;

export const EMPTY_DIMENSIONS = {
  absoluteLeft: 0,
  absoluteTop: 0,
  height: 0,
  width: 0,
};

/**
 * Get the dimensions of the specified DOM element.
 */
export function getDimensions(node: Element | null): Dimensions {
  if (node == null) {
    return EMPTY_DIMENSIONS;
  }
  const rect = node.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    absoluteTop: rect.top + scrollTop,
    absoluteLeft: rect.left + scrollLeft,
    height: rect.height,
    width: rect.width,
  };
}
