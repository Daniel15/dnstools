import React from 'react';

import Checkbox from './Checkbox';
import SelectAllCheckbox from './SelectAllCheckbox';

export type Option = {
  id: string;
  label: React.ReactNode;
};

type Props = {
  id: string;
  options: ReadonlyArray<Option>;
  selectedOptions: ReadonlySet<string>;
  onChange: (values: ReadonlySet<string>) => void;
};

export default function CheckboxList(props: Props) {
  return (
    <>
      <SelectAllCheckbox
        id={`${props.id}-selectAll`}
        options={props.options}
        selectedOptions={props.selectedOptions}
        onChange={props.onChange}
      />
      {props.options.map(option => (
        <Checkbox
          id={`${props.id}-${option.id}`}
          isChecked={props.selectedOptions.has(option.id)}
          key={option.id}
          label={option.label}
          onChange={checked => {
            const newOptions = new Set(props.selectedOptions);
            if (checked) {
              newOptions.add(option.id);
            } else {
              newOptions.delete(option.id);
            }
            props.onChange(newOptions);
          }}
        />
      ))}
    </>
  );
}
