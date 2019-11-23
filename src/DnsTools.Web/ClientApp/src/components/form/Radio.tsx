import React from 'react';

export default function Radio(props: {
  id: string;
  isChecked: boolean;
  label: string;
  name: string;
  onMouseEnter?: (() => void) | undefined;
  onMouseLeave?: (() => void) | undefined;
  onSelect: () => void;
}) {
  return (
    <div
      className="custom-control custom-radio custom-control-inline"
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}>
      <input
        checked={props.isChecked}
        className="custom-control-input"
        id={props.id}
        name={props.name}
        onChange={props.onSelect}
        type="radio"
      />
      <label className="custom-control-label" htmlFor={props.id}>
        {props.label}
      </label>
    </div>
  );
}
