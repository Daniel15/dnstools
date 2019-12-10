import {Config} from '../types/generated';

/**
 * Returns `null` if the specified set of workers contains all the workers, otherwise
 * serializes the selected workers as an array.
 */
export function serializeWorkers(
  config: Config,
  workers: ReadonlySet<string>,
): ReadonlyArray<string> | undefined {
  return workers.size === config.workers.length &&
    config.workers.every(worker => workers.has(worker.id))
    ? undefined
    : Array.from(workers);
}
