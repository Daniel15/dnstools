import React from 'react';

import Radio from './Radio';

type Option<T> = {
  id: string;
  label: string;
  value: T;
};

export default function RadioList<TValue>(props: {
  name: string;
  options: ReadonlyArray<Option<TValue>>;
  selectedValue: TValue | null;
  onRadioMouseEnter?: ((value: TValue) => void) | undefined;
  onRadioMouseLeave?: ((value: TValue) => void) | undefined;
  onSelect: (value: TValue) => void;
}) {
  const {onRadioMouseEnter, onRadioMouseLeave} = props;
  return (
    <>
      {props.options.map(option => (
        <Radio
          id={option.id}
          isChecked={option.value === props.selectedValue}
          key={option.label}
          label={option.label}
          name={props.name}
          onMouseEnter={
            onRadioMouseEnter
              ? () => onRadioMouseEnter(option.value)
              : undefined
          }
          onMouseLeave={
            onRadioMouseLeave
              ? () => onRadioMouseLeave(option.value)
              : undefined
          }
          onSelect={() => props.onSelect(option.value)}
        />
      ))}
    </>
  );
}
