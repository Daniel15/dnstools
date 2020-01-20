import React from 'react';
import useMouseOver from '../hooks/useMouseOver';
import useDimensions from '../hooks/useDimensions';

const ARROW_PADDING = 15;

type Props = Readonly<{
  children: React.ReactNode;
  tooltipBody: React.ReactNode;
}>;
export default function WithHovercard(props: Props) {
  const {ref: contentRef, dimensions: contentPos} = useDimensions();
  const {ref: hovercardRef, dimensions: hovercardPos} = useDimensions();
  const {onMouseEnter, onMouseLeave, isMouseOver} = useMouseOver();

  // Render off-screen until dimensions are measured
  let top = -1000;
  let left = -1000;
  if (contentPos.absoluteTop && hovercardPos.absoluteTop) {
    top = contentPos.absoluteTop - hovercardPos.height - ARROW_PADDING;
    left =
      contentPos.absoluteLeft - hovercardPos.width / 2 + contentPos.width / 2;
  }

  return (
    <>
      <span
        ref={contentRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        {props.children}
      </span>
      {isMouseOver && (
        <div
          className="popover fade show bs-popover-top bg-success"
          ref={hovercardRef}
          role="tooltip"
          style={{left, top}}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}>
          <div
            className="arrow"
            style={{left: hovercardPos.width / 2 - ARROW_PADDING}}></div>
          <div className="popover-body">{props.tooltipBody}</div>
        </div>
      )}
    </>
  );
}
