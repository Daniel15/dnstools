import React, {ReactNode, useState} from 'react';

type Props = Readonly<{
  children: ReactNode;
  id: string;
}>;

export default function DismissableNotice(props: Props) {
  const storageKey = `notice_${props.id}`;
  const [isHidden, setIsHidden] = useState(() => {
    if (!window.localStorage) {
      return false;
    }

    try {
      return !!window.localStorage.getItem(storageKey);
    } catch {
      // eg. storage is disabled
      return false;
    }
  });

  if (isHidden) {
    return null;
  }

  return (
    <div
      className="alert alert-info alert-dismissible fade mx-3 show"
      role="alert">
      {props.children}
      <button
        aria-label="Close"
        className="close"
        data-dismiss="alert"
        type="button"
        onClick={() => {
          setIsHidden(true);
          window.localStorage.setItem(storageKey, '1');
        }}>
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}
