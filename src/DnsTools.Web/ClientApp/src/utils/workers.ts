import {WorkerResponse} from '../types/generated';
import Config from '../config.json';

export type WorkerConfig = typeof Config['workers'][0];

/**
 * Returns `null` if the specified set of workers contains all the workers, otherwise
 * serializes the selected workers as an array.
 */
export function serializeWorkers(
  workers: ReadonlySet<string>,
): ReadonlyArray<string> | undefined {
  return workers.size === Config.workers.length &&
    Config.workers.every(worker => workers.has(worker.id))
    ? undefined
    : Array.from(workers);
}

export function groupResponsesByWorker<T>(
  selectedWorkers: ReadonlySet<string>,
  results: ReadonlyArray<WorkerResponse<T>>,
): ReadonlyArray<
  Readonly<{worker: WorkerConfig; responses: ReadonlyArray<T>}>
> {
  const responsesByWorker: Map<string, Array<T>> = new Map();
  results.forEach(result => {
    let workerResults = responsesByWorker.get(result.workerId);
    if (!workerResults) {
      workerResults = [];
      responsesByWorker.set(result.workerId, workerResults);
    }
    workerResults.push(result.response);
  });

  // Add empty arrays for any workers that haven't returned yet, and keep
  // everything in the same order as the `workers` array.
  return Config.workers
    .filter(worker => selectedWorkers.has(worker.id))
    .map(worker => ({
      worker,
      responses: responsesByWorker.get(worker.id) || [],
    }));
}
