import type { NodeId } from '../ids';

export interface FarmPlot {
  readonly id: number;
  readonly cropNodeId: NodeId | null;
  readonly plantedAt: number;
  readonly readyAt: number;
}

export interface FarmState {
  readonly plotCount: number;
  readonly plots: readonly FarmPlot[];
}

export const DEFAULT_PLOT_COUNT = 4;

export function newFarmState(plotCount: number = DEFAULT_PLOT_COUNT): FarmState {
  const plots: FarmPlot[] = [];
  for (let i = 0; i < plotCount; i++) {
    plots.push({ id: i, cropNodeId: null, plantedAt: 0, readyAt: 0 });
  }
  return { plotCount, plots };
}

export function emptyPlot(id: number): FarmPlot {
  return { id, cropNodeId: null, plantedAt: 0, readyAt: 0 };
}