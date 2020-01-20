import React, {useEffect, useLayoutEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import useMouseOver from '../hooks/useMouseOver';
import useStateRef from '../hooks/useStateRef';
import useLazyRef from '../hooks/useLazyRef';
import {Dimensions, getDimensions, EMPTY_DIMENSIONS} from '../utils/dom';

const ARROW_PADDING = 15;

export enum HovercardLocation {
  Top,
  Right,
}

type Props = Readonly<{
  children: React.ReactNode;
  location: HovercardLocation;
  tooltipBody: React.ReactNode;
}>;
export default function WithHovercard(props: Props) {
  const {onMouseEnter, onMouseLeave, isMouseOver} = useMouseOver();
  const [contentRef, contentNode] = useStateRef<HTMLSpanElement>();

  return (
    <>
      <span
        ref={contentRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        {props.children}
      </span>
      {isMouseOver && (
        <Hovercard
          contentNode={contentNode}
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
  location: HovercardLocation;
  tooltipBody: React.ReactNode;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}>;
function Hovercard(props: HovercardProps) {
  const hovercardNode = useLazyRef(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return el;
  });
  const [contentPos, setContentPos] = useState<Dimensions>(EMPTY_DIMENSIONS);
  const [hovercardPos, setHovercardPos] = useState<Dimensions>(
    EMPTY_DIMENSIONS,
  );

  // Remove DOM node on unmount
  useEffect(() => {
    return () => {
      document.body.removeChild(hovercardNode);
    };
  }, [hovercardNode]);

  useLayoutEffect(() => {
    setContentPos(getDimensions(props.contentNode));
    setHovercardPos(getDimensions(hovercardNode.children[0]));
  }, [hovercardNode, props.contentNode]);

  console.log(contentPos, hovercardPos);

  return ReactDOM.createPortal(
    <div
      className={`popover fade show bg-success ${getClass(props.location)}`}
      role="tooltip"
      style={computeHovercardPosition(props.location, contentPos, hovercardPos)}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}>
      <div
        className="arrow"
        style={computeArrowPosition(props.location, hovercardPos)}></div>
      <div className="popover-body">{props.tooltipBody}</div>
    </div>,
    hovercardNode,
  );
}

function getClass(location: HovercardLocation): string {
  switch (location) {
    case HovercardLocation.Right:
      return 'bs-popover-right';
    case HovercardLocation.Top:
      return 'bs-popover-top';
  }
}

function computeHovercardPosition(
  location: HovercardLocation,
  contentPos: Dimensions,
  hovercardPos: Dimensions,
): Readonly<{
  left: number;
  top: number;
}> {
  if (!contentPos.absoluteLeft || !hovercardPos.absoluteTop) {
    // Render off-screen until dimensions are measured
    return {
      left: -1000,
      top: -1000,
    };
  }

  switch (location) {
    case HovercardLocation.Top:
      return {
        left:
          contentPos.absoluteLeft -
          hovercardPos.width / 2 +
          contentPos.width / 2,
        top: contentPos.absoluteTop - hovercardPos.height - ARROW_PADDING,
      };

    case HovercardLocation.Right:
      return {
        left: contentPos.absoluteLeft + contentPos.width + ARROW_PADDING,
        top:
          contentPos.absoluteTop -
          hovercardPos.height / 2 +
          contentPos.height / 2,
      };
  }
}

function computeArrowPosition(
  location: HovercardLocation,
  hovercardPos: Dimensions,
): Readonly<{left?: number; top?: number}> {
  switch (location) {
    case HovercardLocation.Top:
      return {left: hovercardPos.width / 2 - ARROW_PADDING};

    case HovercardLocation.Right:
      return {top: hovercardPos.height / 2 - ARROW_PADDING};
  }
}
