export function milliseconds(ms: number): string {
  // Truncate to 0.1ms precision
  return Math.floor(ms * 10) / 10 + 'ms';
}
