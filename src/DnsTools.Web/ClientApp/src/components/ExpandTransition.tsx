import React, {memo, DetailedHTMLProps, HTMLAttributes} from 'react';
import {useSpring, animated} from 'react-spring';

import useDimensions from '../hooks/useDimensions';
import usePrevious from '../hooks/usePrevious';

type Props = Readonly<{
  children: React.ReactNode;
  isExpanded: boolean;
}> &
  // Allow all standard <div> attributes - Will be spread onto div
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Animates expanded/collapsed state of a div.
 */
export default memo(function ExpandTransition(props: Props) {
  const {children, isExpanded, ...otherProps} = props;
  const previouslyExpanded = usePrevious(props.isExpanded);
  const [ref, dimensions] = useDimensions<HTMLDivElement>();
  // @ts-ignore https://github.com/react-spring/react-spring/issues/912
  const {height, opacity} = useSpring({
    from: {height: 0, opacity: 0},
    to: {
      height: isExpanded ? dimensions.height : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  return (
    <animated.div
      className="expand-container"
      style={{
        opacity,
        // If we're re-rendering while expanded, don't mess with the height
        height: isExpanded && previouslyExpanded ? 'auto' : height,
      }}>
      <div {...otherProps} ref={ref}>
        {props.children}
      </div>
    </animated.div>
  );
});
