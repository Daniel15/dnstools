import React from 'react';

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
