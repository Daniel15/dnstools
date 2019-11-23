import React from 'react';

export enum Size {
  Small,
  Large,
}

type Props = {
  size?: Size;
};

export default function Spinner(props: Props) {
  let className = 'spinner';
  switch (props.size) {
    case Size.Small:
      className += ' spinner-small';
      break;

    case Size.Large:
    default:
      className += ' spinner-large';
      break;
  }
  return <div className={className}></div>;
}
