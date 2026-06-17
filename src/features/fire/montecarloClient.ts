/**
 * features/fire/montecarloClient — lanza la simulacion en un Web Worker.
 */
import type { MonteCarloParams, MonteCarloResult } from './montecarlo';

/** Ejecuta Monte Carlo en un worker y resuelve con el resultado. */
export const runMonteCarloAsync = (
  params: MonteCarloParams,
): Promise<MonteCarloResult> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./montecarlo.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (event: MessageEvent<MonteCarloResult>): void => {
      resolve(event.data);
      worker.terminate();
    };
    worker.onerror = (event): void => {
      reject(new Error(event.message || 'Error en la simulacion'));
      worker.terminate();
    };
    worker.postMessage(params);
  });
