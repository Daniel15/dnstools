import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {Placement} from '@popperjs/core';

import useMouseOver from '../hooks/useMouseOver';
import useLazyRef from '../hooks/useLazyRef';
import {usePopper} from 'react-popper';

type Props = Readonly<{
  children: React.ReactNode;
  location?: Placement;
  tooltipBody: React.ReactNode;
}>;
export default function WithHovercard(props: Props) {
  const {onMouseEnter, onMouseLeave, isMouseOver} = useMouseOver();
  const [contentRef, setContentRef] = useState<HTMLSpanElement | null>(null);

  return (
    <>
      <span
        ref={setContentRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        {props.children}
      </span>
      {isMouseOver && (
        <Hovercard
          contentNode={contentRef}
          location={props.location}
          tooltipBody={props.tooltipBody}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
    </>
  );
}

type HovercardProps = Readonly<{
  contentNode: HTMLSpanElement | null;
  location?: Placement;
  tooltipBody: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}>;
function Hovercard(props: HovercardProps) {
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const {styles, attributes} = usePopper(props.contentNode, popperElement, {
    modifiers: [{name: 'arrow', options: {element: arrowElement}}],
    placement: props.location,
  });

  const hovercardNode = useLazyRef(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  });

  // Remove DOM node on unmount
  useEffect(() => {
    return () => {
      document.body.removeChild(hovercardNode);
    };
  }, [hovercardNode]);

  return ReactDOM.createPortal(
    <div
      className={`popover fade show bg-success ${getClass(attributes.popper)}`}
      ref={setPopperElement}
      role="tooltip"
      style={styles.popper}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      {...attributes.popper}>
      <div className="arrow" ref={setArrowElement} style={styles.arrow}></div>
      <div className="popover-body">{props.tooltipBody}</div>
    </div>,
    hovercardNode,
  );
}

function getClass(attributes: {[key: string]: string} | undefined): string {
  switch (attributes?.['data-popper-placement']) {
    case 'bottom':
      return 'bs-popover-bottom';
    case 'left':
      return 'bs-popover-left';
    case 'right':
      return 'bs-popover-right';
    case 'top':
      return 'bs-popover-top';
    default:
      return '';
  }
}
