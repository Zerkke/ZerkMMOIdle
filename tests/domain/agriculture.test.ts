import { describe, it, expect } from 'vitest';
import { plantCrop, harvestCrop, isReady, growthProgress } from '../../src/domain/agriculture/engine';
import { newFarmState } from '../../src/domain/agriculture/types';
import { asNodeId } from '../../src/domain/ids';

describe('agricultura', () => {
  it('newFarmState cria parcelas vazias', () => {
    const s = newFarmState(4);
    expect(s.plots).toHaveLength(4);
    expect(s.plots.every((p) => p.cropNodeId === null)).toBe(true);
  });

  it('plantCrop ocupa parcela livre', () => {
    const s = newFarmState(2);
    const r = plantCrop(s, 0, asNodeId('crop.x'), 1000, 0);
    expect(r.error).toBeNull();
    expect(r.state.plots[0]?.cropNodeId).toBe('crop.x');
  });

  it('plantCrop rejeita parcela ocupada', () => {
    const s = newFarmState(2);
    const r1 = plantCrop(s, 0, asNodeId('crop.x'), 1000, 0);
    const r2 = plantCrop(r1.state, 0, asNodeId('crop.y'), 2000, 100);
    expect(r2.error).toBe('plot-occupied');
  });

  it('plantCrop rejeita parcela fora de range', () => {
    const s = newFarmState(2);
    expect(plantCrop(s, 5, asNodeId('crop.x'), 1000, 0).error).toBe('plot-out-of-range');
  });

  it('harvestCrop falha se nao pronto', () => {
    const s = newFarmState(2);
    const r1 = plantCrop(s, 0, asNodeId('crop.x'), 5000, 0);
    const r2 = harvestCrop(r1.state, 0, 3000);
    expect(r2.error).toBe('not-ready');
  });

  it('harvestCrop devolve node quando pronto', () => {
    const s = newFarmState(2);
    const r1 = plantCrop(s, 0, asNodeId('crop.x'), 1000, 0);
    const r2 = harvestCrop(r1.state, 0, 2000);
    expect(r2.error).toBeNull();
    expect(r2.nodeId).toBe('crop.x');
    expect(r2.state.plots[0]?.cropNodeId).toBeNull();
  });

  it('isReady reflete tempo', () => {
    const s = newFarmState(2);
    const r = plantCrop(s, 0, asNodeId('crop.x'), 1000, 0);
    const plot = r.state.plots[0];
    if (!plot) throw new Error('plot missing');
    expect(isReady(plot, 500)).toBe(false);
    expect(isReady(plot, 1500)).toBe(true);
  });

  it('growthProgress varia 0..1', () => {
    const s = newFarmState(2);
    const r = plantCrop(s, 0, asNodeId('crop.x'), 1000, 0);
    const plot = r.state.plots[0];
    if (!plot) throw new Error('plot missing');
    expect(growthProgress(plot, 0)).toBe(0);
    expect(growthProgress(plot, 500)).toBeCloseTo(0.5);
    expect(growthProgress(plot, 1500)).toBe(1);
  });
});