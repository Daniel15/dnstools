export function average(values: ReadonlyArray<number>): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function standardDeviation(values: ReadonlyArray<number>): number {
  const avg = average(values);
  const squareDiffs = values.map(value => {
    const diff = value - avg;
    return diff ** 2;
  });
  const avgSquareDiff = average(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}
