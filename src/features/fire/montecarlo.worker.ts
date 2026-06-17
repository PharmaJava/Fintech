/**
 * features/fire/montecarlo.worker — ejecuta la simulacion de Monte Carlo fuera
 * del hilo principal para no bloquear la UI.
 */
/// <reference lib="webworker" />
import { runMonteCarlo, type MonteCarloParams } from './montecarlo';

self.onmessage = (event: MessageEvent<MonteCarloParams>): void => {
  const result = runMonteCarlo(event.data);
  self.postMessage(result);
};
