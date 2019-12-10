import React from 'react';
import ShimmerBar from './ShimmerBar';

type Props = {
  count: number;
  seq: number;
};

export default function TracerouteResponseLoadingPlaceholder(props: Props) {
  const placeholders = [];
  for (let i = 0; i < props.count; i++) {
    placeholders.push(
      <li className="list-group-item" key={i}>
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 mr-5">
            <ShimmerBar />
          </div>
          <span className="tracert-seq mr-2">{props.seq + i}</span>
        </div>
      </li>,
    );
  }

  return <>{placeholders}</>;
}
