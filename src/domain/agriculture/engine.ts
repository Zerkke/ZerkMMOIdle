import type { FarmState, FarmPlot } from './types';
import { emptyPlot } from './types';
import type { NodeId } from '../ids';

export type FarmOpError =
  | 'plot-out-of-range'
  | 'plot-occupied'
  | 'plot-empty'
  | 'not-ready';

export function plantCrop(state: FarmState, plotId: number, cropNodeId: NodeId, readyAt: number, nowMs: number): { state: FarmState; error: FarmOpError | null } {
  if (plotId < 0 || plotId >= state.plotCount) return { state, error: 'plot-out-of-range' };
  const current = state.plots[plotId];
  if (!current) return { state, error: 'plot-out-of-range' };
  if (current.cropNodeId !== null) return { state, error: 'plot-occupied' };
  const plots = state.plots.slice();
  plots[plotId] = { id: plotId, cropNodeId, plantedAt: nowMs, readyAt };
  return { state: { ...state, plots }, error: null };
}

export function harvestCrop(state: FarmState, plotId: number, nowMs: number): { state: FarmState; nodeId: NodeId | null; error: FarmOpError | null } {
  if (plotId < 0 || plotId >= state.plotCount) return { state, nodeId: null, error: 'plot-out-of-range' };
  const current = state.plots[plotId];
  if (!current) return { state, nodeId: null, error: 'plot-out-of-range' };
  if (current.cropNodeId === null) return { state, nodeId: null, error: 'plot-empty' };
  if (nowMs < current.readyAt) return { state, nodeId: null, error: 'not-ready' };
  const plots = state.plots.slice();
  plots[plotId] = emptyPlot(plotId);
  return { state: { ...state, plots }, nodeId: current.cropNodeId, error: null };
}

export function getPlot(state: FarmState, plotId: number): FarmPlot | null {
  return state.plots[plotId] ?? null;
}

export function isReady(plot: FarmPlot, nowMs: number): boolean {
  return plot.cropNodeId !== null && nowMs >= plot.readyAt;
}

export function growthProgress(plot: FarmPlot, nowMs: number): number {
  if (plot.cropNodeId === null) return 0;
  const total = plot.readyAt - plot.plantedAt;
  if (total <= 0) return 1;
  const elapsed = nowMs - plot.plantedAt;
  return Math.max(0, Math.min(1, elapsed / total));
}