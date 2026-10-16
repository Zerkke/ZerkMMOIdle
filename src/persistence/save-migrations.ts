import type { SaveLatest, SaveV12, SaveV13, SaveV14, SaveV15, SaveV16, SaveV17, ItemStackSnapshot, EssenceInstanceSnapshot, TalentStateSnapshot, SpecializationStateSnapshot, DungeonRunSnapshot, DungeonBestResultSnapshot, ArenaStateSnapshot, ArenaHistorySnapshot, PvpStateSnapshot, PvpSnapshotSnapshot } from './save-schema';
import { SAVE_SCHEMA_VERSION } from './save-schema';

export class SaveParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaveParseError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function migrateToLatest(input: unknown): SaveLatest {
  if (!isRecord(input)) throw new SaveParseError('Save invalido: nao e um objeto.');
  const version = input['schemaVersion'];
  if (typeof version !== 'number' || !Number.isInteger(version)) {
    throw new SaveParseError('Save invalido: schemaVersion ausente ou invalido.');
  }
  if (version > SAVE_SCHEMA_VERSION) {
    throw new SaveParseError('Save de versao superior (' + version + ') nao pode ser carregado.');
  }

  let current: unknown = input;
  let currentVersion = version;

  while (currentVersion < SAVE_SCHEMA_VERSION) {
    switch (currentVersion) {
      case 1: current = migrateV1toV2(current); currentVersion = 2; break;
      case 2: current = migrateV2toV3(current); currentVersion = 3; break;
      case 3: current = migrateV3toV4(current); currentVersion = 4; break;
      case 4: current = migrateV4toV5(current); currentVersion = 5; break;
      case 5: current = migrateV5toV6(current); currentVersion = 6; break;
      case 6: current = migrateV6toV7(current); currentVersion = 7; break;
      case 7: current = migrateV7toV8(current); currentVersion = 8; break;
      case 8: current = migrateV8toV9(current); currentVersion = 9; break;
      case 9: current = migrateV9toV10(current); currentVersion = 10; break;
      case 10: current = migrateV10toV11(current); currentVersion = 11; break;
      case 11: current = migrateV11toV12(current); currentVersion = 12; break;
      case 12: current = migrateV12toV13(current); currentVersion = 13; break;
      case 13: current = migrateV13toV14(current); currentVersion = 14; break;
      case 14: current = migrateV14toV15(current); currentVersion = 15; break;
      case 15: current = migrateV15toV16(current); currentVersion = 16; break;
      case 16: current = migrateV16toV17(current); currentVersion = 17; break;
      default: throw new SaveParseError('Sem migracao da versao ' + currentVersion + '.');
    }
  }

  validateLatest(current);
  return current;
}

/* ============ Helpers de slots ============ */

function patchSlots(rawSlots: unknown): (ItemStackSnapshot | null)[] {
  if (!Array.isArray(rawSlots)) return [];
  return rawSlots.map((s) => {
    if (!s || typeof s !== 'object') return null;
    const rec = s as Record<string, unknown>;
    return {
      itemId: String(rec['itemId'] ?? ''),
      quantity: Number(rec['quantity'] ?? 0),
      enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
      durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
      randomAttributes: null,
      essences: null,
      essenceLevel: null,
    };
  });
}

function patchEquipmentSlots(rawEq: unknown): Record<string, ItemStackSnapshot> {
  if (!rawEq || typeof rawEq !== 'object') return {};
  const out: Record<string, ItemStackSnapshot> = {};
  for (const [k, v] of Object.entries(rawEq as Record<string, unknown>)) {
    if (typeof v === 'string') {
      out[k] = { itemId: v, quantity: 1, enhancementLevel: 0, durability: null, randomAttributes: null, essences: null, essenceLevel: null };
    } else if (v && typeof v === 'object') {
      const rec = v as Record<string, unknown>;
      out[k] = {
        itemId: String(rec['itemId'] ?? ''),
        quantity: Number(rec['quantity'] ?? 1),
        enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
        durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
        randomAttributes: null,
        essences: null,
        essenceLevel: null,
      };
    }
  }
  return out;
}

/* ============ Migracoes ============ */

function migrateV1toV2(v1: unknown): unknown {
  if (!isRecord(v1)) throw new SaveParseError('V1 invalido.');
  return {
    schemaVersion: 2, savedAt: typeof v1['savedAt'] === 'number' ? v1['savedAt'] : Date.now(),
    character: v1['character'], inventory: v1['inventory'], equipment: v1['equipment'],
    combat: null,
    combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
  };
}

function migrateV2toV3(v2: unknown): unknown {
  if (!isRecord(v2)) throw new SaveParseError('V2 invalido.');
  const inv = (v2['inventory'] && isRecord(v2['inventory'])) ? v2['inventory'] as Record<string, unknown> : {};
  const eq = (v2['equipment'] && isRecord(v2['equipment'])) ? v2['equipment'] as Record<string, unknown> : {};
  return {
    schemaVersion: 3, savedAt: typeof v2['savedAt'] === 'number' ? v2['savedAt'] : Date.now(),
    character: v2['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    combat: v2['combat'] ?? null,
    combatConfig: v2['combatConfig'] ?? { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
    enhancementHistory: Array.isArray(v2['enhancementHistory']) ? v2['enhancementHistory'] : [],
  };
}

function migrateV3toV4(v3: unknown): unknown {
  if (!isRecord(v3)) throw new SaveParseError('V3 invalido.');
  const inv = (v3['inventory'] && isRecord(v3['inventory'])) ? v3['inventory'] as Record<string, unknown> : {};
  const eq = (v3['equipment'] && isRecord(v3['equipment'])) ? v3['equipment'] as Record<string, unknown> : {};
  return {
    schemaVersion: 4, savedAt: typeof v3['savedAt'] === 'number' ? v3['savedAt'] : Date.now(),
    character: v3['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    combat: v3['combat'] ?? null,
    combatConfig: v3['combatConfig'] ?? { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
    enhancementHistory: Array.isArray(v3['enhancementHistory']) ? v3['enhancementHistory'] : [],
    professionStates: {}, activity: null,
  };
}

function migrateV4toV5(v4: unknown): unknown {
  if (!isRecord(v4)) throw new SaveParseError('V4 invalido.');
  const inv = (v4['inventory'] && isRecord(v4['inventory'])) ? v4['inventory'] as Record<string, unknown> : {};
  const eq = (v4['equipment'] && isRecord(v4['equipment'])) ? v4['equipment'] as Record<string, unknown> : {};
  return {
    schemaVersion: 5, savedAt: typeof v4['savedAt'] === 'number' ? v4['savedAt'] : Date.now(),
    character: v4['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    combat: v4['combat'] ?? null,
    combatConfig: v4['combatConfig'],
    enhancementHistory: Array.isArray(v4['enhancementHistory']) ? v4['enhancementHistory'] : [],
    professionStates: isRecord(v4['professionStates']) ? v4['professionStates'] : {},
    activity: v4['activity'] ?? null,
    buffs: [], farm: [],
  };
}

function migrateV5toV6(v5: unknown): unknown {
  if (!isRecord(v5)) throw new SaveParseError('V5 invalido.');
  const inv = (v5['inventory'] && isRecord(v5['inventory'])) ? v5['inventory'] as Record<string, unknown> : {};
  const eq = (v5['equipment'] && isRecord(v5['equipment'])) ? v5['equipment'] as Record<string, unknown> : {};
  return {
    schemaVersion: 6, savedAt: typeof v5['savedAt'] === 'number' ? v5['savedAt'] : Date.now(),
    character: v5['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    warehouse: { capacity: 100, slots: [] },
    combat: v5['combat'] ?? null,
    combatConfig: v5['combatConfig'],
    enhancementHistory: Array.isArray(v5['enhancementHistory']) ? v5['enhancementHistory'] : [],
    professionStates: isRecord(v5['professionStates']) ? v5['professionStates'] : {},
    activity: v5['activity'] ?? null,
    buffs: Array.isArray(v5['buffs']) ? v5['buffs'] : [],
    farm: Array.isArray(v5['farm']) ? v5['farm'] : [],
    transactions: [],
  };
}

function migrateV6toV7(v6: unknown): unknown {
  if (!isRecord(v6)) throw new SaveParseError('V6 invalido.');
  const inv = (v6['inventory'] && isRecord(v6['inventory'])) ? v6['inventory'] as Record<string, unknown> : {};
  const eq = (v6['equipment'] && isRecord(v6['equipment'])) ? v6['equipment'] as Record<string, unknown> : {};
  const wh = (v6['warehouse'] && isRecord(v6['warehouse'])) ? v6['warehouse'] as Record<string, unknown> : {};
  return {
    schemaVersion: 7, savedAt: typeof v6['savedAt'] === 'number' ? v6['savedAt'] : Date.now(),
    character: v6['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlots(wh['slots']) },
    combat: v6['combat'] ?? null,
    combatConfig: v6['combatConfig'],
    enhancementHistory: Array.isArray(v6['enhancementHistory']) ? v6['enhancementHistory'] : [],
    professionStates: isRecord(v6['professionStates']) ? v6['professionStates'] : {},
    activity: v6['activity'] ?? null,
    buffs: Array.isArray(v6['buffs']) ? v6['buffs'] : [],
    farm: Array.isArray(v6['farm']) ? v6['farm'] : [],
    transactions: Array.isArray(v6['transactions']) ? v6['transactions'] : [],
    idleSetup: null, lastIdleReport: null,
  };
}

function migrateV7toV8(v7: unknown): unknown {
  if (!isRecord(v7)) throw new SaveParseError('V7 invalido.');
  const inv = (v7['inventory'] && isRecord(v7['inventory'])) ? v7['inventory'] as Record<string, unknown> : {};
  const eq = (v7['equipment'] && isRecord(v7['equipment'])) ? v7['equipment'] as Record<string, unknown> : {};
  const wh = (v7['warehouse'] && isRecord(v7['warehouse'])) ? v7['warehouse'] as Record<string, unknown> : {};
  return {
    schemaVersion: 8, savedAt: typeof v7['savedAt'] === 'number' ? v7['savedAt'] : Date.now(),
    character: v7['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlots(wh['slots']) },
    combat: v7['combat'] ?? null,
    combatConfig: v7['combatConfig'],
    enhancementHistory: Array.isArray(v7['enhancementHistory']) ? v7['enhancementHistory'] : [],
    professionStates: isRecord(v7['professionStates']) ? v7['professionStates'] : {},
    activity: v7['activity'] ?? null,
    buffs: Array.isArray(v7['buffs']) ? v7['buffs'] : [],
    farm: Array.isArray(v7['farm']) ? v7['farm'] : [],
    transactions: Array.isArray(v7['transactions']) ? v7['transactions'] : [],
    idleSetup: v7['idleSetup'] ?? null,
    lastIdleReport: v7['lastIdleReport'] ?? null,
    tutorial: null,
  };
}

function migrateV8toV9(v8: unknown): unknown {
  if (!isRecord(v8)) throw new SaveParseError('V8 invalido.');
  const inv = (v8['inventory'] && isRecord(v8['inventory'])) ? v8['inventory'] as Record<string, unknown> : {};
  const eq = (v8['equipment'] && isRecord(v8['equipment'])) ? v8['equipment'] as Record<string, unknown> : {};
  const wh = (v8['warehouse'] && isRecord(v8['warehouse'])) ? v8['warehouse'] as Record<string, unknown> : {};
  return {
    schemaVersion: 9,
    savedAt: typeof v8['savedAt'] === 'number' ? v8['savedAt'] : Date.now(),
    character: v8['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlots(wh['slots']) },
    combat: v8['combat'] ?? null,
    combatConfig: v8['combatConfig'],
    enhancementHistory: Array.isArray(v8['enhancementHistory']) ? v8['enhancementHistory'] : [],
    professionStates: isRecord(v8['professionStates']) ? v8['professionStates'] : {},
    activity: v8['activity'] ?? null,
    buffs: Array.isArray(v8['buffs']) ? v8['buffs'] : [],
    farm: Array.isArray(v8['farm']) ? v8['farm'] : [],
    transactions: Array.isArray(v8['transactions']) ? v8['transactions'] : [],
    idleSetup: v8['idleSetup'] ?? null,
    lastIdleReport: v8['lastIdleReport'] ?? null,
    tutorial: v8['tutorial'] ?? null,
  };
}

function migrateV9toV10(v9: unknown): unknown {
  if (!isRecord(v9)) throw new SaveParseError('V9 invalido.');
  const inv = (v9['inventory'] && isRecord(v9['inventory'])) ? v9['inventory'] as Record<string, unknown> : {};
  const eq = (v9['equipment'] && isRecord(v9['equipment'])) ? v9['equipment'] as Record<string, unknown> : {};
  const wh = (v9['warehouse'] && isRecord(v9['warehouse'])) ? v9['warehouse'] as Record<string, unknown> : {};
  return {
    schemaVersion: 10,
    savedAt: typeof v9['savedAt'] === 'number' ? v9['savedAt'] : Date.now(),
    character: v9['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlots(inv['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlots(wh['slots']) },
    equipment: { slots: patchEquipmentSlots(eq['slots']) },
    combat: v9['combat'] ?? null,
    combatConfig: v9['combatConfig'],
    enhancementHistory: Array.isArray(v9['enhancementHistory']) ? v9['enhancementHistory'] : [],
    professionStates: isRecord(v9['professionStates']) ? v9['professionStates'] : {},
    activity: v9['activity'] ?? null,
    buffs: Array.isArray(v9['buffs']) ? v9['buffs'] : [],
    farm: Array.isArray(v9['farm']) ? v9['farm'] : [],
    transactions: Array.isArray(v9['transactions']) ? v9['transactions'] : [],
    idleSetup: v9['idleSetup'] ?? null,
    lastIdleReport: v9['lastIdleReport'] ?? null,
    tutorial: v9['tutorial'] ?? null,
    quests: [],
  };
}

function migrateV10toV11(v10: unknown): unknown {
  if (!isRecord(v10)) throw new SaveParseError('V10 invalido.');
  const inv = (v10['inventory'] && isRecord(v10['inventory'])) ? v10['inventory'] as Record<string, unknown> : {};
  const eq = (v10['equipment'] && isRecord(v10['equipment'])) ? v10['equipment'] as Record<string, unknown> : {};
  const wh = (v10['warehouse'] && isRecord(v10['warehouse'])) ? v10['warehouse'] as Record<string, unknown> : {};
  const patchSlotsV11 = (rawSlots: unknown): (ItemStackSnapshot | null)[] => {
    if (!Array.isArray(rawSlots)) return [];
    return rawSlots.map((s) => {
      if (!s || typeof s !== 'object') return null;
      const rec = s as Record<string, unknown>;
      return {
        itemId: String(rec['itemId'] ?? ''),
        quantity: Number(rec['quantity'] ?? 0),
        enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
        durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
        randomAttributes: Array.isArray(rec['randomAttributes']) ? (rec['randomAttributes'] as readonly { kind: string; value: number }[]) : null,
        essences: null,
        essenceLevel: null,
      };
    });
  };
  const patchEqV11 = (rawEq: unknown): Record<string, ItemStackSnapshot> => {
    if (!rawEq || typeof rawEq !== 'object') return {};
    const out: Record<string, ItemStackSnapshot> = {};
    for (const [k, v] of Object.entries(rawEq as Record<string, unknown>)) {
      if (v && typeof v === 'object') {
        const rec = v as Record<string, unknown>;
        out[k] = {
          itemId: String(rec['itemId'] ?? ''),
          quantity: Number(rec['quantity'] ?? 1),
          enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
          durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
          randomAttributes: Array.isArray(rec['randomAttributes']) ? (rec['randomAttributes'] as readonly { kind: string; value: number }[]) : null,
          essences: null,
          essenceLevel: null,
        };
      }
    }
    return out;
  };
  return {
    schemaVersion: 11,
    savedAt: typeof v10['savedAt'] === 'number' ? v10['savedAt'] : Date.now(),
    character: v10['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlotsV11(inv['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlotsV11(wh['slots']) },
    equipment: { slots: patchEqV11(eq['slots']) },
    combat: v10['combat'] ?? null,
    combatConfig: v10['combatConfig'],
    enhancementHistory: Array.isArray(v10['enhancementHistory']) ? v10['enhancementHistory'] : [],
    professionStates: isRecord(v10['professionStates']) ? v10['professionStates'] : {},
    activity: v10['activity'] ?? null,
    buffs: Array.isArray(v10['buffs']) ? v10['buffs'] : [],
    farm: Array.isArray(v10['farm']) ? v10['farm'] : [],
    transactions: Array.isArray(v10['transactions']) ? v10['transactions'] : [],
    idleSetup: v10['idleSetup'] ?? null,
    lastIdleReport: v10['lastIdleReport'] ?? null,
    tutorial: v10['tutorial'] ?? null,
    quests: Array.isArray(v10['quests']) ? v10['quests'] : [],
  };
}

function migrateV11toV12(v11: unknown): SaveV12 {
  if (!isRecord(v11)) throw new SaveParseError('V11 invalido.');
  if (!isRecord(v11['character']) || !isRecord(v11['equipment']) || !isRecord(v11['combatConfig'])) {
    throw new SaveParseError('V11 incompleto.');
  }
  const inv = (v11['inventory'] && isRecord(v11['inventory'])) ? v11['inventory'] as Record<string, unknown> : {};
  const eq = (v11['equipment'] && isRecord(v11['equipment'])) ? v11['equipment'] as Record<string, unknown> : {};
  const wh = (v11['warehouse'] && isRecord(v11['warehouse'])) ? v11['warehouse'] as Record<string, unknown> : {};

  const convertEssences = (raw: unknown): readonly (EssenceInstanceSnapshot | null)[] | null => {
    if (!Array.isArray(raw)) return null;
    return raw.map((e) => {
      if (e === null || e === undefined) return null;
      if (typeof e === 'string') return { itemId: e, level: 1 };
      if (typeof e === 'object') {
        const rec = e as Record<string, unknown>;
        return { itemId: String(rec['itemId'] ?? ''), level: Number(rec['level'] ?? 1) };
      }
      return null;
    });
  };

  const patchSlotsV12 = (rawSlots: unknown): (ItemStackSnapshot | null)[] => {
    if (!Array.isArray(rawSlots)) return [];
    return rawSlots.map((s) => {
      if (!s || typeof s !== 'object') return null;
      const rec = s as Record<string, unknown>;
      return {
        itemId: String(rec['itemId'] ?? ''),
        quantity: Number(rec['quantity'] ?? 0),
        enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
        durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
        randomAttributes: Array.isArray(rec['randomAttributes']) ? (rec['randomAttributes'] as readonly { kind: string; value: number }[]) : null,
        essences: convertEssences(rec['essences']),
        essenceLevel: rec['essenceLevel'] === null || rec['essenceLevel'] === undefined ? null : Number(rec['essenceLevel']),
      };
    });
  };
  const patchEqV12 = (rawEq: unknown): Record<string, ItemStackSnapshot> => {
    if (!rawEq || typeof rawEq !== 'object') return {};
    const out: Record<string, ItemStackSnapshot> = {};
    for (const [k, v] of Object.entries(rawEq as Record<string, unknown>)) {
      if (v && typeof v === 'object') {
        const rec = v as Record<string, unknown>;
        out[k] = {
          itemId: String(rec['itemId'] ?? ''),
          quantity: Number(rec['quantity'] ?? 1),
          enhancementLevel: Number(rec['enhancementLevel'] ?? 0),
          durability: rec['durability'] === null || rec['durability'] === undefined ? null : Number(rec['durability']),
          randomAttributes: Array.isArray(rec['randomAttributes']) ? (rec['randomAttributes'] as readonly { kind: string; value: number }[]) : null,
          essences: convertEssences(rec['essences']),
          essenceLevel: rec['essenceLevel'] === null || rec['essenceLevel'] === undefined ? null : Number(rec['essenceLevel']),
        };
      }
    }
    return out;
  };

  return {
    schemaVersion: 12,
    savedAt: typeof v11['savedAt'] === 'number' ? v11['savedAt'] : Date.now(),
    character: v11['character'] as unknown as SaveV12['character'],
    inventory: { capacity: Number(inv['capacity'] ?? 40), slots: patchSlotsV12(inv['slots']) },
    warehouse: { capacity: Number(wh['capacity'] ?? 100), slots: patchSlotsV12(wh['slots']) },
    equipment: { slots: patchEqV12(eq['slots']) },
    combat: (v11['combat'] as unknown as SaveV12['combat']) ?? null,
    combatConfig: v11['combatConfig'] as unknown as SaveV12['combatConfig'],
    enhancementHistory: Array.isArray(v11['enhancementHistory']) ? (v11['enhancementHistory'] as SaveV12['enhancementHistory']) : [],
    professionStates: isRecord(v11['professionStates']) ? (v11['professionStates'] as SaveV12['professionStates']) : {},
    activity: (v11['activity'] as SaveV12['activity']) ?? null,
    buffs: Array.isArray(v11['buffs']) ? (v11['buffs'] as SaveV12['buffs']) : [],
    farm: Array.isArray(v11['farm']) ? (v11['farm'] as SaveV12['farm']) : [],
    transactions: Array.isArray(v11['transactions']) ? (v11['transactions'] as SaveV12['transactions']) : [],
    idleSetup: (v11['idleSetup'] as SaveV12['idleSetup']) ?? null,
    lastIdleReport: (v11['lastIdleReport'] as SaveV12['lastIdleReport']) ?? null,
    tutorial: (v11['tutorial'] as SaveV12['tutorial']) ?? null,
    quests: Array.isArray(v11['quests']) ? (v11['quests'] as SaveV12['quests']) : [],
  };
}

function migrateV12toV13(v12: unknown): SaveV13 {
  if (!isRecord(v12)) throw new SaveParseError('V12 invalido.');
  if (!isRecord(v12['character']) || !isRecord(v12['equipment']) || !isRecord(v12['combatConfig'])) {
    throw new SaveParseError('V12 incompleto.');
  }
  const talentsRaw = v12['talents'];
  let talents: TalentStateSnapshot = { ranks: {}, respecCount: 0 };
  if (isRecord(talentsRaw)) {
    const ranksRaw = talentsRaw['ranks'];
    const ranks: Record<string, number> = {};
    if (isRecord(ranksRaw)) {
      for (const [k, v] of Object.entries(ranksRaw)) {
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) ranks[k] = Math.floor(v);
      }
    }
    const respecCount = typeof talentsRaw['respecCount'] === 'number' && Number.isFinite(talentsRaw['respecCount']) ? Math.max(0, Math.floor(talentsRaw['respecCount'] as number)) : 0;
    talents = { ranks, respecCount };
  }
  const v12c = v12 as unknown as SaveV12;
  return {
    schemaVersion: 13,
    savedAt: v12c.savedAt,
    character: v12c.character,
    inventory: v12c.inventory,
    warehouse: v12c.warehouse,
    equipment: v12c.equipment,
    combat: v12c.combat,
    combatConfig: v12c.combatConfig,
    enhancementHistory: v12c.enhancementHistory,
    professionStates: v12c.professionStates,
    activity: v12c.activity,
    buffs: v12c.buffs,
    farm: v12c.farm,
    transactions: v12c.transactions,
    idleSetup: v12c.idleSetup,
    lastIdleReport: v12c.lastIdleReport,
    tutorial: v12c.tutorial,
    quests: v12c.quests,
    talents,
  };
}
function migrateV13toV14(v13: unknown): SaveV14 {
  if (!isRecord(v13)) throw new SaveParseError('V13 invalido.');
  if (!isRecord(v13['character']) || !isRecord(v13['equipment']) || !isRecord(v13['combatConfig'])) {
    throw new SaveParseError('V13 incompleto.');
  }
  const specRaw = v13['specialization'];
  let specialization: SpecializationStateSnapshot = { active: null, changeCount: 0, lastChangeAt: 0 };
  if (isRecord(specRaw)) {
    const active = specRaw['active'];
    const changeCount = typeof specRaw['changeCount'] === 'number' && Number.isFinite(specRaw['changeCount']) ? Math.max(0, Math.floor(specRaw['changeCount'] as number)) : 0;
    const lastChangeAt = typeof specRaw['lastChangeAt'] === 'number' && Number.isFinite(specRaw['lastChangeAt']) ? Math.max(0, Math.floor(specRaw['lastChangeAt'] as number)) : 0;
    specialization = {
      active: typeof active === 'string' ? active : null,
      changeCount,
      lastChangeAt,
    };
  }
  const v13c = v13 as unknown as SaveV13;
  return {
    schemaVersion: 14,
    savedAt: v13c.savedAt,
    character: v13c.character,
    inventory: v13c.inventory,
    warehouse: v13c.warehouse,
    equipment: v13c.equipment,
    combat: v13c.combat,
    combatConfig: v13c.combatConfig,
    enhancementHistory: v13c.enhancementHistory,
    professionStates: v13c.professionStates,
    activity: v13c.activity,
    buffs: v13c.buffs,
    farm: v13c.farm,
    transactions: v13c.transactions,
    idleSetup: v13c.idleSetup,
    lastIdleReport: v13c.lastIdleReport,
    tutorial: v13c.tutorial,
    quests: v13c.quests,
    talents: v13c.talents,
    specialization,
  };
}
function migrateV14toV15(v14: unknown): SaveV15 {
  if (!isRecord(v14)) throw new SaveParseError('V14 invalido.');
  if (!isRecord(v14['character']) || !isRecord(v14['equipment']) || !isRecord(v14['combatConfig'])) {
    throw new SaveParseError('V14 incompleto.');
  }

  let active: DungeonRunSnapshot | null = null;
  const results: Record<string, DungeonBestResultSnapshot> = {};

  const dRaw = v14['dungeons'];
  if (isRecord(dRaw)) {
    const aRaw = dRaw['active'];
    if (isRecord(aRaw)) {
      const dungeonId = typeof aRaw['dungeonId'] === 'string' ? aRaw['dungeonId'] : '';
      if (dungeonId) {
        active = {
          dungeonId,
          startedAt: typeof aRaw['startedAt'] === 'number' && Number.isFinite(aRaw['startedAt']) ? Math.floor(aRaw['startedAt'] as number) : Date.now(),
          waveIndex: typeof aRaw['waveIndex'] === 'number' && Number.isFinite(aRaw['waveIndex']) ? Math.max(0, Math.floor(aRaw['waveIndex'] as number)) : 0,
          monsterIndex: typeof aRaw['monsterIndex'] === 'number' && Number.isFinite(aRaw['monsterIndex']) ? Math.max(0, Math.floor(aRaw['monsterIndex'] as number)) : 0,
          totalKills: typeof aRaw['totalKills'] === 'number' && Number.isFinite(aRaw['totalKills']) ? Math.max(0, Math.floor(aRaw['totalKills'] as number)) : 0,
        };
      }
    }
    const rRaw = dRaw['results'];
    if (isRecord(rRaw)) {
      for (const [k, v] of Object.entries(rRaw)) {
        if (!isRecord(v)) continue;
        results[k] = {
          dungeonId: k,
          completions: typeof v['completions'] === 'number' && Number.isFinite(v['completions']) ? Math.max(0, Math.floor(v['completions'] as number)) : 0,
          bestTimeMs: typeof v['bestTimeMs'] === 'number' && Number.isFinite(v['bestTimeMs']) ? Math.floor(v['bestTimeMs'] as number) : null,
          firstClearedAt: typeof v['firstClearedAt'] === 'number' && Number.isFinite(v['firstClearedAt']) ? Math.floor(v['firstClearedAt'] as number) : null,
          lastClearedAt: typeof v['lastClearedAt'] === 'number' && Number.isFinite(v['lastClearedAt']) ? Math.floor(v['lastClearedAt'] as number) : null,
        };
      }
    }
  }

  const v14c = v14 as unknown as SaveV14;
  return {
    schemaVersion: 15,
    savedAt: v14c.savedAt,
    character: v14c.character,
    inventory: v14c.inventory,
    warehouse: v14c.warehouse,
    equipment: v14c.equipment,
    combat: v14c.combat,
    combatConfig: v14c.combatConfig,
    enhancementHistory: v14c.enhancementHistory,
    professionStates: v14c.professionStates,
    activity: v14c.activity,
    buffs: v14c.buffs,
    farm: v14c.farm,
    transactions: v14c.transactions,
    idleSetup: v14c.idleSetup,
    lastIdleReport: v14c.lastIdleReport,
    tutorial: v14c.tutorial,
    quests: v14c.quests,
    talents: v14c.talents,
    specialization: v14c.specialization,
    dungeons: { active, results },
  };
}
function migrateV15toV16(v15: unknown): SaveV16 {
  if (!isRecord(v15)) throw new SaveParseError('V15 invalido.');
  if (!isRecord(v15['character']) || !isRecord(v15['equipment']) || !isRecord(v15['combatConfig'])) {
    throw new SaveParseError('V15 incompleto.');
  }

  let arena: ArenaStateSnapshot = {
    rating: 1000, peakRating: 1000, fightsToday: 0, lastResetAt: 0,
    totalWins: 0, totalLosses: 0, history: [],
  };
  const aRaw = v15['arena'];
  if (isRecord(aRaw)) {
    const num = (v: unknown, def: number, min = 0): number => {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < min) return def;
      return Math.floor(v);
    };
    const history: ArenaHistorySnapshot[] = [];
    const hRaw = aRaw['history'];
    if (Array.isArray(hRaw)) {
      for (const e of hRaw) {
        if (!isRecord(e)) continue;
        history.push({
          foughtAt: num(e['foughtAt'], 0),
          opponentId: typeof e['opponentId'] === 'string' ? e['opponentId'] : '',
          opponentName: typeof e['opponentName'] === 'string' ? e['opponentName'] : '',
          won: e['won'] === true,
          ratingBefore: num(e['ratingBefore'], 1000),
          ratingAfter: num(e['ratingAfter'], 1000),
          silverGained: num(e['silverGained'], 0),
          xpGained: num(e['xpGained'], 0),
        });
      }
    }
    arena = {
      rating: num(aRaw['rating'], 1000),
      peakRating: num(aRaw['peakRating'], 1000),
      fightsToday: num(aRaw['fightsToday'], 0),
      lastResetAt: num(aRaw['lastResetAt'], 0),
      totalWins: num(aRaw['totalWins'], 0),
      totalLosses: num(aRaw['totalLosses'], 0),
      history,
    };
  }

  const v15c = v15 as unknown as SaveV15;
  return {
    schemaVersion: 16,
    savedAt: v15c.savedAt,
    character: v15c.character,
    inventory: v15c.inventory,
    warehouse: v15c.warehouse,
    equipment: v15c.equipment,
    combat: v15c.combat,
    combatConfig: v15c.combatConfig,
    enhancementHistory: v15c.enhancementHistory,
    professionStates: v15c.professionStates,
    activity: v15c.activity,
    buffs: v15c.buffs,
    farm: v15c.farm,
    transactions: v15c.transactions,
    idleSetup: v15c.idleSetup,
    lastIdleReport: v15c.lastIdleReport,
    tutorial: v15c.tutorial,
    quests: v15c.quests,
    talents: v15c.talents,
    specialization: v15c.specialization,
    dungeons: v15c.dungeons,
    arena,
  };
}
function migrateV16toV17(v16: unknown): SaveV17 {
  if (!isRecord(v16)) throw new SaveParseError('V16 invalido.');
  if (!isRecord(v16['character']) || !isRecord(v16['equipment']) || !isRecord(v16['combatConfig'])) {
    throw new SaveParseError('V16 incompleto.');
  }

  let pvp: PvpStateSnapshot = {
    registeredBuild: null,
    registeredAt: null,
    dailyAttacksUsed: 0,
    dailyResetAt: 0,
    localRating: 1000,
    localPeakRating: 1000,
    localWins: 0,
    localLosses: 0,
    history: [],
  };

  const pRaw = v16['pvp'];
  if (isRecord(pRaw)) {
    const num = (v: unknown, def: number, min = 0): number => {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < min) return def;
      return Math.floor(v);
    };
    const rb = pRaw['registeredBuild'];
    let registeredBuild: PvpSnapshotSnapshot | null = null;
    if (isRecord(rb)) {
      registeredBuild = {
        version: num(rb['version'], 1, 1),
        characterName: typeof rb['characterName'] === 'string' ? rb['characterName'] : '',
        characterLevel: num(rb['characterLevel'], 1, 1),
        specId: typeof rb['specId'] === 'string' ? rb['specId'] : null,
        maxHp: num(rb['maxHp'], 100, 1),
        maxResource: num(rb['maxResource'], 50, 0),
        attack: num(rb['attack'], 10, 1),
        defense: num(rb['defense'], 0, 0),
        ap: num(rb['ap'], 0, 0),
        dp: num(rb['dp'], 0, 0),
        critChance: num(rb['critChance'], 0, 0),
        critDamage: num(rb['critDamage'], 0, 0),
        lifesteal: num(rb['lifesteal'], 0, 0),
        damageReduction: num(rb['damageReduction'], 0, 0),
        hpRegenPerSec: num(rb['hpRegenPerSec'], 0, 0),
        attackIntervalMs: num(rb['attackIntervalMs'], 1000, 200),
        resourceRegenPerSec: num(rb['resourceRegenPerSec'], 3, 0),
        skills: [],
      };
      const skillsRaw = rb['skills'];
      if (Array.isArray(skillsRaw)) {
        const skills: { id: string; kind: 'damage' | 'heal'; cooldownMs: number; resourceCost: number; multiplier: number }[] = [];
        for (const s of skillsRaw) {
          if (!isRecord(s)) continue;
          skills.push({
            id: typeof s['id'] === 'string' ? s['id'] : '',
            kind: s['kind'] === 'heal' ? 'heal' : 'damage',
            cooldownMs: num(s['cooldownMs'], 5000, 100),
            resourceCost: num(s['resourceCost'], 0, 0),
            multiplier: num(s['multiplier'], 1, 0),
          });
        }
        registeredBuild = { ...registeredBuild, skills };
      }
    }

    const hist: import('./save-schema').PvpHistorySnapshot[] = [];
    const hRaw = pRaw['history'];
    if (Array.isArray(hRaw)) {
      for (const e of hRaw) {
        if (!isRecord(e)) continue;
        hist.push({
          foughtAt: num(e['foughtAt'], 0),
          defenderId: typeof e['defenderId'] === 'string' ? e['defenderId'] : '',
          defenderName: typeof e['defenderName'] === 'string' ? e['defenderName'] : '',
          won: e['won'] === true,
          attackerRatingBefore: num(e['attackerRatingBefore'], 1000),
          attackerRatingAfter: num(e['attackerRatingAfter'], 1000),
          defenderRatingBefore: num(e['defenderRatingBefore'], 1000),
          defenderRatingAfter: num(e['defenderRatingAfter'], 1000),
        });
      }
    }

    pvp = {
      registeredBuild,
      registeredAt: typeof pRaw['registeredAt'] === 'number' && Number.isFinite(pRaw['registeredAt']) ? Math.floor(pRaw['registeredAt'] as number) : null,
      dailyAttacksUsed: num(pRaw['dailyAttacksUsed'], 0),
      dailyResetAt: num(pRaw['dailyResetAt'], 0),
      localRating: num(pRaw['localRating'], 1000),
      localPeakRating: num(pRaw['localPeakRating'], 1000),
      localWins: num(pRaw['localWins'], 0),
      localLosses: num(pRaw['localLosses'], 0),
      history: hist,
    };
  }

  const v16c = v16 as unknown as SaveV16;
  return {
    schemaVersion: 17,
    savedAt: v16c.savedAt,
    character: v16c.character,
    inventory: v16c.inventory,
    warehouse: v16c.warehouse,
    equipment: v16c.equipment,
    combat: v16c.combat,
    combatConfig: v16c.combatConfig,
    enhancementHistory: v16c.enhancementHistory,
    professionStates: v16c.professionStates,
    activity: v16c.activity,
    buffs: v16c.buffs,
    farm: v16c.farm,
    transactions: v16c.transactions,
    idleSetup: v16c.idleSetup,
    lastIdleReport: v16c.lastIdleReport,
    tutorial: v16c.tutorial,
    quests: v16c.quests,
    talents: v16c.talents,
    specialization: v16c.specialization,
    dungeons: v16c.dungeons,
    arena: v16c.arena,
    pvp,
  };
}
function validateLatest(value: unknown): asserts value is SaveLatest {
  if (!isRecord(value)) throw new SaveParseError('Save final invalido.');
  if (value['schemaVersion'] !== SAVE_SCHEMA_VERSION) throw new SaveParseError('Versao inesperada.');
  if (!isRecord(value['character'])) throw new SaveParseError('Sem personagem.');
  if (!isRecord(value['inventory'])) throw new SaveParseError('Sem inventario.');
  if (!isRecord(value['warehouse'])) throw new SaveParseError('Sem armazem.');
  if (!isRecord(value['equipment'])) throw new SaveParseError('Sem equipamento.');
  if (!isRecord(value['combatConfig'])) throw new SaveParseError('Sem combatConfig.');
  if (!Array.isArray(value['quests'])) throw new SaveParseError('Sem quests.');
  if (!isRecord(value['talents'])) throw new SaveParseError('Sem talents.');
  if (!isRecord(value['specialization'])) throw new SaveParseError('Sem specialization.');
  if (!isRecord(value['dungeons'])) throw new SaveParseError('Sem dungeons.');
  if (!isRecord(value['arena'])) throw new SaveParseError('Sem arena.');
  if (!isRecord(value['pvp'])) throw new SaveParseError('Sem pvp.');
  if (typeof value['savedAt'] !== 'number') throw new SaveParseError('Sem savedAt.');
}