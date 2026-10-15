import { describe, it, expect } from 'vitest';
import { saveToJson, loadFromJson } from '../../src/persistence/json-io';
import { emptySave } from '../../src/persistence/save-schema';
import { SaveParseError } from '../../src/persistence/save-migrations';

describe('json-io', () => {
  it('round-trip basico', () => {
    const original = emptySave(12345);
    const parsed = loadFromJson(saveToJson(original));
    expect(parsed.savedAt).toBe(12345);
    expect(parsed.schemaVersion).toBe(12);
  });
  it('rejeita JSON invalido', () => {
    expect(() => loadFromJson('{invalid')).toThrow(SaveParseError);
  });
  it('rejeita forma errada', () => {
    expect(() => loadFromJson('{"foo":"bar"}')).toThrow(SaveParseError);
  });
});