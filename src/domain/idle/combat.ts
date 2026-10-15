import type { SeededRng } from './rng';
import { MAX_SIM_ITERATIONS } from './types';

export interface CombatIdleMonster {
  readonly monsterId: string;
  readonly weight: number;
  readonly killTimeMs: number;
  readonly hpLossPerKill: number;
  readonly expReward: number;
  readonly silverReward: number;
  readonly loot: readonly {
    readonly itemId: string;
    readonly chance: number;
    readonly min: number;
    readonly max: number;
  }[];
}

export interface CombatIdleInput {
  readonly monsters: readonly CombatIdleMonster[];
  readonly playerMaxHp: number;
  readonly playerHpAtStart: number;
  readonly hpRecoveryPerKill: number;
  readonly maxHpItems: number;
  readonly hpItemHealAmount: number;
  readonly hpItemThreshold: number; // 0..1
}

export interface CombatIdleOutcome {
  readonly kills: number;
  readonly xpGained: number;
  readonly silverGained: number;
  readonly loot: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly hpItemsUsed: number;
  readonly survived: boolean;
  readonly stoppedReason: 'completed' | 'dead' | 'no-hp-item' | 'iteration-cap';
}

export function simulateCombat(input: CombatIdleInput, elapsedMs: number, rng: SeededRng): CombatIdleOutcome {
  if (input.monsters.length === 0) {
    return { kills: 0, xpGained: 0, silverGained: 0, loot: [], hpItemsUsed: 0, survived: true, stoppedReason: 'completed' };
  }

  const totalWeight = input.monsters.reduce((s, m) => s + Math.max(0, m.weight), 0);
  let remainingMs = elapsedMs;
  let hp = input.playerHpAtStart;
  let kills = 0;
  let xp = 0;
  let silver = 0;
  let hpItemsUsed = 0;
  const lootTotals = new Map<string, number>();
  let iter = 0;

  while (remainingMs > 0 && iter < MAX_SIM_ITERATIONS) {
    iter++;

    // Pega o monstro
    let monster = input.monsters[0];
    if (monster === undefined) break;
    if (totalWeight > 0) {
      const pick = rng.next() * totalWeight;
      let accum = 0;
      for (const m of input.monsters) {
        accum += Math.max(0, m.weight);
        if (pick < accum) { monster = m; break; }
      }
    }

    if (remainingMs < monster.killTimeMs) break;
    remainingMs -= monster.killTimeMs;
    kills++;
    xp += monster.expReward;
    silver += monster.silverReward;

    for (const loot of monster.loot) {
      if (rng.next() < loot.chance) {
        const span = loot.max - loot.min + 1;
        const qty = loot.min + Math.floor(rng.next() * span);
        lootTotals.set(loot.itemId, (lootTotals.get(loot.itemId) ?? 0) + qty);
      }
    }

    hp -= monster.hpLossPerKill;

    // Cura passiva entre kills
    hp = Math.min(input.playerMaxHp, hp + input.hpRecoveryPerKill);

    // Auto-consumo se HP baixo
    if (hp / input.playerMaxHp < input.hpItemThreshold && input.hpItemHealAmount > 0) {
      if (hpItemsUsed >= input.maxHpItems) {
        return {
          kills, xpGained: xp, silverGained: silver,
          loot: mapToLoot(lootTotals), hpItemsUsed, survived: false,
          stoppedReason: 'no-hp-item',
        };
      }
      hpItemsUsed++;
      hp = Math.min(input.playerMaxHp, hp + input.hpItemHealAmount);
    }

    if (hp <= 0) {
      return {
        kills, xpGained: xp, silverGained: silver,
        loot: mapToLoot(lootTotals), hpItemsUsed, survived: false,
        stoppedReason: 'dead',
      };
    }
  }

  const stoppedReason = iter >= MAX_SIM_ITERATIONS ? 'iteration-cap' : 'completed';
  return {
    kills, xpGained: xp, silverGained: silver,
    loot: mapToLoot(lootTotals), hpItemsUsed, survived: true,
    stoppedReason,
  };
}

function mapToLoot(m: Map<string, number>): { itemId: string; quantity: number }[] {
  const out: { itemId: string; quantity: number }[] = [];
  for (const [itemId, quantity] of m) out.push({ itemId, quantity });
  return out;
}