import type { PvpSnapshot } from './types';
import type {
  CombatConfig,
  CombatOutcome,
  MonsterCombatInput,
  PlayerCombatInput,
  TickResult,
} from '../combat/types';
import { DEFAULT_COMBAT_CONFIG, newCombatState, tickCombat } from '../combat';
import type { SkillDefinition } from '../content';
import { asSkillId } from '../ids';

const SIM_MS = 1_800_000;

export function snapshotToPlayerInput(snap: PvpSnapshot): PlayerCombatInput {
  const skills: SkillDefinition[] = snap.skills.map((s) => ({
    id: asSkillId(s.id),
    name: s.id,
    description: '',
    kind: s.kind,
    cooldownMs: s.cooldownMs,
    resourceCost: s.resourceCost,
    multiplier: s.multiplier,
    requiredLevel: 1,
  }));
  return {
    attack: snap.attack,
    defense: snap.defense,
    damageReduction: snap.damageReduction,
    critChance: snap.critChance,
    critDamageMultiplier: 1.5 + snap.critDamage,
    maxHp: snap.maxHp,
    maxResource: snap.maxResource,
    resourceRegenPerSec: snap.resourceRegenPerSec,
    lifesteal: snap.lifesteal,
    attackIntervalMs: snap.attackIntervalMs,
    skills,
  };
}

export function snapshotToMonsterInput(snap: PvpSnapshot): MonsterCombatInput {
  return {
    attack: snap.attack,
    defense: snap.defense,
    maxHp: snap.maxHp,
    attackIntervalMs: snap.attackIntervalMs,
  };
}

export interface DuelResult {
  readonly outcome: CombatOutcome;
  readonly playerHp: number;
  readonly monsterHp: number;
  readonly totalPlayerDamage: number;
  readonly totalMonsterDamage: number;
  readonly tick: TickResult;
}

/**
 * Simula um duelo PvP deterministico. O atacante e o "player" do combate.
 * Determinismo: usa o rng passado (deve ser seeded com hash dos dois snapshots).
 */
export function simulateDuel(
  attacker: PvpSnapshot,
  defender: PvpSnapshot,
  rng: () => number,
  nowMs: number,
): DuelResult {
  const player = snapshotToPlayerInput(attacker);
  const monster = snapshotToMonsterInput(defender);
  const config: CombatConfig = { ...DEFAULT_COMBAT_CONFIG, strategy: 'balanced' };
  const state = newCombatState(nowMs, player, monster);
  const tick = tickCombat({
    state,
    deltaMs: SIM_MS,
    player,
    monster,
    config,
    rng,
  });

  let totalPlayerDamage = 0;
  let totalMonsterDamage = 0;
  for (const ev of tick.events) {
    if (ev.kind === 'player-basic') totalPlayerDamage += ev.damage;
    else if (ev.kind === 'player-skill') totalPlayerDamage += ev.damage;
    else if (ev.kind === 'monster-basic') totalMonsterDamage += ev.damage;
  }

  return {
    outcome: tick.state.outcome,
    playerHp: tick.state.playerHp,
    monsterHp: tick.state.monsterHp,
    totalPlayerDamage,
    totalMonsterDamage,
    tick,
  };
}

/**
 * RNG deterministico a partir de dois snapshots + salt.
 * Mesma seed -> mesmo resultado -> servidor pode validar.
 */
export function makeDeterministicRng(a: PvpSnapshot, b: PvpSnapshot, salt: number): () => number {
  const key = a.characterName + '|' + a.characterLevel + '|' + b.characterName + '|' + b.characterLevel + '|' + salt;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let state = h || 1;
  return () => {
    let x = state;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    state = x;
    return state / 0x100000000;
  };
}

export function validateSnapshot(snap: unknown): snap is PvpSnapshot {
  if (!snap || typeof snap !== 'object') return false;
  const s = snap as Record<string, unknown>;
  if (s['version'] !== 1) return false;
  if (typeof s['characterName'] !== 'string') return false;
  if (typeof s['maxHp'] !== 'number' || s['maxHp'] <= 0) return false;
  if (typeof s['attack'] !== 'number' || s['attack'] <= 0) return false;
  if (!Array.isArray(s['skills'])) return false;
  return true;
}