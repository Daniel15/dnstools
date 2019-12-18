const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;
const SECONDS_IN_DAY = SECONDS_IN_HOUR * 24;

export function milliseconds(ms: number): string {
  // Truncate to 0.1ms precision
  return Math.floor(ms * 10) / 10 + 'ms';
}

export function duration(seconds: number): string {
  const days = Math.floor(seconds / SECONDS_IN_DAY);
  seconds -= days * SECONDS_IN_DAY;
  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  seconds -= hours * SECONDS_IN_HOUR;
  const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
  seconds -= minutes * SECONDS_IN_MINUTE;

  const pieces = [];
  if (days > 0) {
    pieces.push(`${days} day${days === 1 ? '' : 's'}`);
  }
  if (hours > 0) {
    pieces.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }
  if (minutes > 0) {
    pieces.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }
  if (seconds > 0 || pieces.length === 0) {
    pieces.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
  }

  return pieces.join(', ');
}
