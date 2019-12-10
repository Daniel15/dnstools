import React from 'react';

import {Option} from './CheckboxList';
import Checkbox from './Checkbox';

type Props = {
  id: string;
  options: ReadonlyArray<Option>;
  selectedOptions: ReadonlySet<string>;
  onChange: (values: ReadonlySet<string>) => void;
};

export default function SelectAllCheckbox(props: Props) {
  const allSelected =
    props.options.length === props.selectedOptions.size &&
    props.options.every(option => props.selectedOptions.has(option.id));

  return (
    <Checkbox
      id={`${props.id}`}
      isChecked={allSelected}
      isIndeterminate={!allSelected && props.selectedOptions.size > 0}
      label="Select All"
      onChange={() => {
        // If "a lot" of options are selected, clicking "Select All" deselects everything
        // If very few options are selected, clicking "Select All" selects everything
        const newSelected = new Set(
          props.selectedOptions.size > props.options.length / 2
            ? []
            : props.options.map(option => option.id),
        );
        props.onChange(newSelected);
      }}
    />
  );
}
