import React, {useState, memo, DetailedHTMLProps, HTMLAttributes} from 'react';

import useDimensions from '../hooks/useDimensions';
import useLayoutEffectExceptInitialRender from '../hooks/useLayoutEffectExceptInitialRender';

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
  const [hasCompletedAnimation, setHasCompletedAnimation] = useState<boolean>(
    true,
  );
  const [renderAsExpanded, setRenderAsExpanded] = useState<boolean>(
    props.isExpanded,
  );
  const [ref, dimensions] = useDimensions<HTMLDivElement>();

  useLayoutEffectExceptInitialRender(() => {
    setHasCompletedAnimation(false);
    // Allow it to render in the old state for one frame (to get rid of the `auto`),
    // then re-render with the new expanded state, to start the animation.
    setTimeout(() => setRenderAsExpanded(props.isExpanded), 0);
  }, [props.isExpanded]);

  let renderHeight: number | string = renderAsExpanded ? dimensions.height : 0;
  if (props.isExpanded && hasCompletedAnimation) {
    // If we're re-rendering while expanded, don't mess with the height
    // (prevents animating this expand area if there's a nested expand area
    // within it that's expanding)
    renderHeight = 'auto';
  }

  return (
    <div
      className="expand-container"
      style={{
        height: renderHeight,
        opacity: renderAsExpanded ? 1 : 0,
      }}
      onTransitionEnd={() => {
        setHasCompletedAnimation(true);
      }}>
      {(props.isExpanded || !hasCompletedAnimation) && (
        <div ref={ref}>
          <div {...otherProps}>{props.children}</div>
        </div>
      )}
    </div>
  );
});
