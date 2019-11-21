import React from 'react';

export default function ShimmerBar() {
  return (
    <div className="progress">
      <div
        className="progress-bar progress-bar-striped progress-bar-animated"
        style={{width: '100%'}}></div>
    </div>
  );
}
