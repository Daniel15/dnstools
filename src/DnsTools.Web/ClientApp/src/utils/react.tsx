/**
 * Utilities for React
 */
import React from 'react';

/**
 * Insert commas inbetween React components.
 */
export function commaSeparate(
  components: ReadonlyArray<React.ReactElement>,
  conjunction: string | null = null,
): React.ReactElement {
  if (components.length === 0) {
    return <></>;
  }
  if (components.length === 1) {
    return components[0];
  }

  const output: Array<React.ReactNode> = [components[0]];
  for (let i = 1; i < components.length; i++) {
    output.push(', ');
    output.push(components[i]);
  }

  if (conjunction != null) {
    output.splice(output.length - 1, 0, conjunction + ' ');
  }

  return <>{output}</>;
}
