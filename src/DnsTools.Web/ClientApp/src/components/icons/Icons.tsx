import React from 'react';
import {SortOrder} from '../Table';

export function ExpandChevron(
  props: Readonly<{
    isExpanded: boolean;
  }>,
) {
  return (
    <svg
      aria-hidden="false"
      aria-label={props.isExpanded ? 'Collapse' : 'Expand'}
      className={
        'expand-icon ' + (props.isExpanded ? 'expand-icon-expanded' : '')
      }
      height="16"
      role="img"
      viewBox="0 0 8 16"
      width="8"
      style={{
        display: 'inline-block',
        fill: 'currentcolor',
        userSelect: 'none',
        verticalAlign: 'text-bottom',
      }}>
      <path
        fillRule="evenodd"
        d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"></path>
    </svg>
  );
}

export function Sort({
  state,
}: Readonly<{
  state: SortOrder;
}>) {
  let label;
  switch (state) {
    case SortOrder.ASC:
      label = 'Sorted in ascending order';
      break;
    case SortOrder.DESC:
      label = 'Sorted in descending order';
      break;
    case SortOrder.NONE:
      label = 'Sort';
      break;
  }

  const showUpArrow = state === SortOrder.ASC || state === SortOrder.NONE;
  const showDownArrow = state === SortOrder.DESC || state === SortOrder.NONE;
  const onlyShowOne = state !== SortOrder.NONE;

  const SORT_DISABLED_COLOR = '#666';
  const SPACE_BETWEEN_ARROWS = 20;

  return (
    <svg
      viewBox={`0 ${onlyShowOne ? -25 : 0} 100 ${100 + SPACE_BETWEEN_ARROWS}`}
      width="12"
      height="14"
      aria-hidden={false}
      aria-label={label}>
      {showUpArrow && (
        <path
          d="
            m 100,50
            l -50,-50
            l -50,50
            l 100,0
            z"
          fill={state === SortOrder.ASC ? 'white' : SORT_DISABLED_COLOR}
          fill-rule="evenodd"
        />
      )}
      {showDownArrow && (
        <path
          d={`
            m 0,${onlyShowOne ? 0 : 50 + SPACE_BETWEEN_ARROWS}
            l 50,50
            l 50,-50
            l -100,0
            z`}
          fill={state === SortOrder.DESC ? 'white' : SORT_DISABLED_COLOR}
          fill-rule="evenodd"
        />
      )}
    </svg>
  );
}
