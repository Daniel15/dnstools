import React, {useEffect, useRef} from 'react';

type Props = {
  id: string;
  isChecked: boolean;
  isIndeterminate?: boolean;
  label: React.ReactNode;
  onChange: (value: boolean) => void;
};

export default function Checkbox(props: Props) {
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = !!props.isIndeterminate;
    }
  }, [props.isIndeterminate]);

  return (
    <div className="custom-control custom-checkbox">
      <input
        checked={props.isChecked && !props.isIndeterminate}
        className="custom-control-input"
        id={props.id}
        ref={checkboxRef}
        type="checkbox"
        onChange={evt => props.onChange(evt.target.checked)}
      />
      <label className="custom-control-label" htmlFor={props.id}>
        {props.label}
      </label>
    </div>
  );
}
