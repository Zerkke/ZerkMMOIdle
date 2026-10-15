import { describe, it, expect } from 'vitest';
import { GAME_CONFIG } from '../src/config/game-config';
import { TypedEventBus } from '../src/core/event-bus';

describe('Configuracao do jogo', () => {
  it('deve ter nome correto', () => {
    expect(GAME_CONFIG.name).toBe('Zerk Idle MMORPG');
  });

  it('deve ter versao definida', () => {
    expect(GAME_CONFIG.version).toBeDefined();
    expect(typeof GAME_CONFIG.version).toBe('string');
  });

  it('deve ter dimensoes positivas', () => {
    expect(GAME_CONFIG.width).toBeGreaterThan(0);
    expect(GAME_CONFIG.height).toBeGreaterThan(0);
  });

  it('deve ter cores validas', () => {
    expect(GAME_CONFIG.colors.background).toBeTypeOf('number');
    expect(GAME_CONFIG.colors.accent).toBeTypeOf('number');
    expect(GAME_CONFIG.colors.text).toBeTypeOf('number');
  });
});

describe('TypedEventBus', () => {
  it('deve registar e emitir eventos tipados', () => {
    const bus = new TypedEventBus<{ 'test:event': { value: number } }>();
    let received: number | null = null;

    const unsubscribe = bus.on('test:event', (payload) => {
      received = payload.value;
    });

    bus.emit('test:event', { value: 42 });
    expect(received).toBe(42);

    unsubscribe();
    bus.emit('test:event', { value: 99 });
    expect(received).toBe(42);
  });

  it('deve limpar todos os listeners com removeAll', () => {
    const bus = new TypedEventBus<{
      a: { x: number };
      b: { y: number };
    }>();

    let count = 0;
    bus.on('a', () => { count++; });
    bus.on('b', () => { count++; });

    bus.emit('a', { x: 1 });
    bus.emit('b', { y: 2 });
    expect(count).toBe(2);

    bus.removeAll();
    bus.emit('a', { x: 3 });
    bus.emit('b', { y: 4 });
    expect(count).toBe(2);
  });
});