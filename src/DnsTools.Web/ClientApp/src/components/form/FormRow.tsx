import React, {ReactNode} from 'react';

export default function FormRow(props: {
  children: ReactNode;
  id: string;
  isInput?: boolean;
  label: string;
}) {
  const isInput = props.isInput === true || props.isInput == null;
  return (
    <div className="form-group row">
      <label
        htmlFor={props.id}
        className={'col-sm-1' + (isInput ? ' col-form-label' : '')}>
        {props.label}:
      </label>
      <div className="col-sm-11">{props.children}</div>
    </div>
  );
}
