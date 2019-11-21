import {WorkerResponse, WorkerConfig} from './types/generated';

export default function groupResponsesByWorker<T>(
  workers: ReadonlyArray<WorkerConfig>,
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
  return workers.map(worker => ({
    worker,
    responses: responsesByWorker.get(worker.id) || [],
  }));
}
