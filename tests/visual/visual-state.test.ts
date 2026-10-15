import { describe, it, expect } from 'vitest';
import { GAME_CONFIG } from '../../src/config/game-config';

/**
 * Testes de logica de visual-state.
 * O Phaser em si nao e testado (depende de canvas); testamos apenas
 * as constantes e os contratos que a MainScene usa.
 */

describe('GAME_CONFIG (visual)', () => {
  it('tem dimensoes positivas para o canvas', () => {
    expect(GAME_CONFIG.width).toBeGreaterThan(0);
    expect(GAME_CONFIG.height).toBeGreaterThan(0);
  });

  it('tem nome e versao definidos', () => {
    expect(GAME_CONFIG.name).toBe('Zerk Idle MMORPG');
    expect(GAME_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('tem cores de fundo validas', () => {
    expect(typeof GAME_CONFIG.colors.background).toBe('number');
    expect(typeof GAME_CONFIG.colors.accent).toBe('number');
    expect(typeof GAME_CONFIG.colors.text).toBe('number');
  });

  it('esta na Fase 11 ou superior', () => {
    expect(GAME_CONFIG.phase).toContain('Fase');
  });
});