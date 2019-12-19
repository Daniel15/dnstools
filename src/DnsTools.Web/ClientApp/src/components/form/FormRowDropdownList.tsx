import {useSelect} from 'downshift';
import React from 'react';

export type Option = {
  id: string;
  label: React.ReactNode;
};

type Props = {
  label: string;
  options: ReadonlyArray<Option>;
  selectedItem: string | null;
  onSelect: (value: string | null) => void;
};

export default function FormRowDropdownList(props: Props) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
    // `as Option[]` is due to loose typing in Downshift
  } = useSelect({
    items: props.options as Option[],
    onSelectedItemChange: x =>
      props.onSelect(x.selectedItem ? x.selectedItem.id : null),
    selectedItem:
      props.selectedItem == null
        ? null
        : props.options.find(option => option.id === props.selectedItem),
  });
  return (
    <div className="form-group row">
      <label {...getLabelProps({className: 'col-sm-1 col-form-label'})}>
        {props.label}:
      </label>
      <div className={`col-sm-11 dropdown ${isOpen ? 'show' : ''}`}>
        <button
          {...getToggleButtonProps({
            className: 'btn btn-secondary dropdown-toggle',
            type: 'button',
          })}>
          {(selectedItem && selectedItem.label) || 'None'}
        </button>
        <div
          {...getMenuProps()}
          className={`dropdown-menu dropdown-list ${isOpen ? 'show' : ''}`}>
          <ul className="p-0">
            {isOpen &&
              props.options.map((item, index) => (
                <li
                  className={`dropdown-item ${
                    highlightedIndex === index ? 'active' : ''
                  }`}
                  key={item.id}
                  {...getItemProps({item, index})}>
                  {item.label}
                </li>
              ))}
          </ul>
        </div>
        {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
        <div tabIndex={0} />
      </div>
    </div>
  );
}
