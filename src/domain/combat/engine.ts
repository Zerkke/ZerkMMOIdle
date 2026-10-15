import { computeDamage } from './damage';
import type {
  CombatConfig,
  CombatEvent,
  CombatState,
  MonsterCombatInput,
  PlayerCombatInput,
  TickInput,
  TickResult,
} from './types';
import type { SkillDefinition } from '../content';
import type { SkillId } from '../ids';

const MAX_ITERATIONS = 5000;

interface Action {
  readonly kind: 'basic';
}

interface SkillAction {
  readonly kind: 'skill';
  readonly skill: SkillDefinition;
}

type ChosenAction = Action | SkillAction;

function chooseAction(
  state: CombatState,
  config: CombatConfig,
  player: PlayerCombatInput,
): ChosenAction {
  if (!config.useSkills) return { kind: 'basic' };

  const now = state.timeMs;
  const isReady = (skillId: SkillId): boolean => (state.playerSkillReadyAt.get(skillId) ?? 0) <= now;
  const canAfford = (skill: SkillDefinition): boolean => state.playerResource >= skill.resourceCost;
  const usable = player.skills.filter((s) => isReady(s.id) && canAfford(s));

  // Heal prioritario quando HP baixo e nao estritamente agressivo
  if (config.strategy !== 'aggressive') {
    const hpRatio = state.playerHp / player.maxHp;
    if (hpRatio < 0.35) {
      const heal = usable.find((s) => s.kind === 'heal');
      if (heal) return { kind: 'skill', skill: heal };
    }
  }

  // Melhor skill de dano disponivel
  const dmgSkills = usable
    .filter((s) => s.kind === 'damage')
    .sort((a, b) => b.multiplier - a.multiplier);
  const best = dmgSkills[0];
  if (best) return { kind: 'skill', skill: best };

  return { kind: 'basic' };
}

export function tickCombat(input: TickInput): TickResult {
  const { deltaMs, player, monster, config, rng } = input;
  const events: CombatEvent[] = [];
  let state = input.state;

  if (state.outcome !== 'ongoing' || deltaMs <= 0) {
    return { state, events };
  }

  // Regen de recurso passivo durante o intervalo
  const regenAmount = (player.resourceRegenPerSec * deltaMs) / 1000;
  state = {
    ...state,
    playerResource: Math.min(player.maxResource, state.playerResource + regenAmount),
  };

  const endTime = state.timeMs + deltaMs;
  let iter = 0;

  while (iter++ < MAX_ITERATIONS && state.outcome === 'ongoing') {
    const playerNextAt = state.playerNextAttackAt;
    const monsterNextAt = state.monsterNextAttackAt;
    const nextEventAt = Math.min(playerNextAt, monsterNextAt);

    if (nextEventAt > endTime) break;

    if (playerNextAt <= monsterNextAt) {
      // Turno do jogador
      const action = chooseAction(state, config, player);
      let damage = 0;
      let heal = 0;
      const newReadyAt = new Map(state.playerSkillReadyAt);
      let newResource = state.playerResource;
      let eventEntry: CombatEvent;

      if (action.kind === 'skill') {
        const skill = action.skill;
        newReadyAt.set(skill.id, playerNextAt + skill.cooldownMs);
        newResource = Math.max(0, newResource - skill.resourceCost);

        if (skill.kind === 'damage') {
          const r = computeDamage({
            attack: player.attack,
            multiplier: skill.multiplier,
            defense: monster.defense,
            critChance: player.critChance,
            critDamageMultiplier: player.critDamageMultiplier,
            rng,
          });
          damage = r.damage;
          eventEntry = { kind: 'player-skill', skillId: skill.id, damage, heal: 0, crit: r.crit };
        } else {
          heal = Math.floor(player.maxHp * skill.multiplier);
          eventEntry = { kind: 'player-skill', skillId: skill.id, damage: 0, heal, crit: false };
        }
      } else {
        const r = computeDamage({
          attack: player.attack,
          multiplier: 1,
          defense: monster.defense,
          critChance: player.critChance,
          critDamageMultiplier: player.critDamageMultiplier,
          rng,
        });
        damage = r.damage;
        eventEntry = { kind: 'player-basic', damage, crit: r.crit };
      }

      const lifestealHeal = Math.floor(damage * (player.lifesteal ?? 0));
      const newMonsterHp = Math.max(0, state.monsterHp - damage);
      const newPlayerHp = Math.min(player.maxHp, state.playerHp + heal + lifestealHeal);

      state = {
        ...state,
        timeMs: playerNextAt,
        playerHp: newPlayerHp,
        playerResource: newResource,
        playerSkillReadyAt: newReadyAt,
        playerNextAttackAt: playerNextAt + player.attackIntervalMs,
        monsterHp: newMonsterHp,
      };
      events.push(eventEntry);

      if (newMonsterHp <= 0) {
        state = { ...state, outcome: 'victory' };
        events.push({ kind: 'victory' });
        break;
      }
    } else {
      // Turno do monstro
      const r = computeDamage({
        attack: monster.attack,
        multiplier: 1,
        defense: player.defense,
        critChance: 0,
        damageReduction: player.damageReduction,
        rng,
      });
      const newPlayerHp = Math.max(0, state.playerHp - r.damage);

      state = {
        ...state,
        timeMs: monsterNextAt,
        playerHp: newPlayerHp,
        monsterNextAttackAt: monsterNextAt + monster.attackIntervalMs,
      };
      events.push({ kind: 'monster-basic', damage: r.damage });

      if (newPlayerHp <= 0) {
        state = { ...state, outcome: 'defeat' };
        events.push({ kind: 'defeat' });
        break;
      }
    }
  }

  if (state.outcome === 'ongoing') {
    state = { ...state, timeMs: endTime };
  }

  return { state, events };
}

/** Constroi o estado inicial de um combate fresco. */
export function newCombatState(
  nowMs: number,
  player: PlayerCombatInput,
  monster: MonsterCombatInput,
): CombatState {
  return {
    timeMs: nowMs,
    playerHp: player.maxHp,
    playerResource: player.maxResource,
    playerNextAttackAt: nowMs + player.attackIntervalMs,
    playerSkillReadyAt: new Map(),
    monsterHp: monster.maxHp,
    monsterNextAttackAt: nowMs + monster.attackIntervalMs,
    outcome: 'ongoing',
  };
}