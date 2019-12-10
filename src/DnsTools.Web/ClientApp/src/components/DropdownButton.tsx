import React, {useRef, useState} from 'react';
import useOnClickOutside from 'use-onclickoutside';

type Props = {
  children: React.ReactNode;
  id: string;
  label: string;
};

export default function DropdownButton(props: Props) {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  useOnClickOutside(rootRef, () => setIsOpen(false));

  return (
    <div className={`dropdown ${isOpen ? 'show' : ''}`} ref={rootRef}>
      <button
        className="btn btn-secondary dropdown-toggle"
        id={props.id}
        onClick={() => setIsOpen(value => !value)}
        type="button"
        data-toggle="dropdown"
        aria-haspopup={true}
        aria-expanded={isOpen}>
        {props.label}
      </button>
      <div
        className={`dropdown-menu ${isOpen ? 'show' : ''}`}
        aria-labelledby={props.id}>
        {props.children}
      </div>
    </div>
  );
}
