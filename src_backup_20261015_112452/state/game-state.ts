import type { ContentRegistry } from '../data/registry';
import { GameServices } from '../services/game-services';

export interface GameState {
  readonly registry: ContentRegistry;
  readonly services: GameServices;
}

export async function createGameState(
  registry: ContentRegistry,
  loadSave: () => Promise<import('../persistence/save-schema').SaveLatest>,
): Promise<GameState> {
  const save = await loadSave();
  const services = new GameServices(registry, save);
  return { registry, services };
}