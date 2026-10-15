import type { ItemDefinition, ItemRarity } from '../content';
import { isEquippable } from '../content';
import type {
  RandomAttributeDefinition,
  RandomAttributeKind,
  RandomAttributeRoll,
  RandomBonusBundle,
} from './types';
import { EMPTY_BONUS_BUNDLE, RARITY_PROFILES } from './types';

export type Rng = () => number;

function pickCount(rarity: ItemRarity, rng: Rng): number {
  const p = RARITY_PROFILES[rarity];
  if (!p) return 0;
  const span = p.maxCount - p.minCount + 1;
  return p.minCount + Math.floor(rng() * span);
}

function pickCandidates(
  item: ItemDefinition,
  defs: readonly RandomAttributeDefinition[],
): RandomAttributeDefinition[] {
  const slot = item.equipSlot;
  if (!slot) return [];
  return defs.filter((d) => d.compatibleSlots === 'any' || d.compatibleSlots.includes(slot));
}

function rollValue(
  def: RandomAttributeDefinition,
  itemLevel: number,
  powerMult: number,
  rng: Rng,
): number {
  const min = def.minBase + def.levelScale * (itemLevel - 1);
  const max = def.maxBase + def.levelScale * (itemLevel - 1);
  const raw = min + rng() * Math.max(0, max - min);
  const scaled = raw * powerMult;
  if (def.unit === 'flat') return Math.max(1, Math.round(scaled));
  return Math.round(scaled * 10000) / 10000;
}

/** Gera os rolls aleatorios de um item recem-criado. */
export function rollRandomAttributes(
  item: ItemDefinition,
  definitions: readonly RandomAttributeDefinition[],
  rng: Rng,
): readonly RandomAttributeRoll[] {
  if (!isEquippable(item)) return [];
  const profile = RARITY_PROFILES[item.rarity];
  if (!profile) return [];

  const count = pickCount(item.rarity, rng);
  if (count <= 0) return [];

  const candidates = pickCandidates(item, definitions);
  if (candidates.length === 0) return [];

  const pool = candidates.slice();
  const picked: RandomAttributeDefinition[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(rng() * pool.length);
    const def = pool[idx];
    if (!def) break;
    picked.push(def);
    pool.splice(idx, 1);
  }

  return picked.map((d) => ({
    kind: d.kind,
    value: rollValue(d, item.requiredLevel, profile.powerMultiplier, rng),
  }));
}

/** Formata um roll para exibicao. */
export function formatRandomAttribute(
  roll: RandomAttributeRoll,
  defs: readonly RandomAttributeDefinition[],
): string {
  const def = defs.find((d) => d.kind === roll.kind);
  if (!def) return '';
  if (def.unit === 'percent') {
    return '+' + (roll.value * 100).toFixed(1) + '% ' + def.name;
  }
  return '+' + roll.value + ' ' + def.name;
}

/** Soma os rolls de varias instancias num bundle. */
export function sumRolls(rolls: readonly (readonly RandomAttributeRoll[] | null)[]): RandomBonusBundle {
  const b = { ...EMPTY_BONUS_BUNDLE } as {
    attack: number; maxHp: number; defense: number;
    critChance: number; critDamage: number;
    bonusXp: number; bonusSilver: number; gatherYield: number;
  };
  for (const list of rolls) {
    if (!list) continue;
    for (const r of list) {
      switch (r.kind) {
        case 'attack': b.attack += r.value; break;
        case 'max-hp': b.maxHp += r.value; break;
        case 'defense': b.defense += r.value; break;
        case 'crit-chance': b.critChance += r.value; break;
        case 'crit-damage': b.critDamage += r.value; break;
        case 'bonus-xp': b.bonusXp += r.value; break;
        case 'bonus-silver': b.bonusSilver += r.value; break;
        case 'gather-yield': b.gatherYield += r.value; break;
      }
    }
  }
  return b;
}

export function countRolls(rolls: readonly RandomAttributeRoll[] | null): number {
  return rolls ? rolls.length : 0;
}

export function isRollsEqual(
  a: readonly RandomAttributeRoll[] | null,
  b: readonly RandomAttributeRoll[] | null,
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ra = a[i]; const rb = b[i];
    if (!ra || !rb) return false;
    if (ra.kind !== rb.kind || ra.value !== rb.value) return false;
  }
  return true;
}

/** Helper para iterar os tipos (mantido para API publica). */
export const ALL_RANDOM_ATTRIBUTE_KINDS: readonly RandomAttributeKind[] = [
  'attack', 'max-hp', 'defense',
  'crit-chance', 'crit-damage',
  'bonus-xp', 'bonus-silver',
  'gather-yield',
];