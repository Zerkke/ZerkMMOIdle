import type { SaveLatest } from './save-schema';
import { migrateToLatest, SaveParseError } from './save-migrations';

export function saveToJson(save: SaveLatest): string {
  return JSON.stringify(save, null, 2);
}

export function loadFromJson(text: string): SaveLatest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SaveParseError('JSON invalido.');
  }
  return migrateToLatest(parsed);
}