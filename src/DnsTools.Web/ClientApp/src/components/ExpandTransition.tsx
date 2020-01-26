import React, {DetailedHTMLProps, HTMLAttributes} from 'react';
import {useSpring, animated} from 'react-spring';

import useDimensions from '../hooks/useDimensions';

type Props = Readonly<{
  children: React.ReactNode;
  isExpanded: boolean;
}> &
  // Allow all standard <div> attributes - Will be spread onto div
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Animates expanded/collapsed state of a div.
 */
export default function ExpandTransition(props: Props) {
  const {children, isExpanded, ...otherProps} = props;
  const [ref, dimensions] = useDimensions<HTMLDivElement>();
  const style = useSpring({
    from: {height: 0, opacity: 0},
    to: {
      height: isExpanded ? dimensions.height : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  return (
    <animated.div style={{overflow: 'hidden', ...style}}>
      <div {...otherProps} ref={ref}>
        {props.children}
      </div>
    </animated.div>
  );
}
