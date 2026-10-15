import type { Attributes, PowerStats } from '../attributes';
import type { ItemDefinition } from '../content';
import { BALANCE } from '../../data/balance.config';

/**
 * Bonus totais de um item melhorado a um certo nivel.
 * Devolve TODAS as camadas afetadas (AP, DP, atributos, HP, crit, regen, lifesteal).
 */
export interface EnhancementBonuses {
  readonly attackPower: number;
  readonly defensePower: number;
  readonly hp: number;
  readonly critChance: number;   // 0..1
  readonly critDamage: number;   // 0..1
  readonly hpRegen: number;      // por segundo
  readonly lifesteal: number;    // 0..1
  readonly damageReduction: number; // 0..1
  readonly strength: number;
  readonly agility: number;
  readonly intelligence: number;
  readonly vitality: number;
  readonly extraRolls: number;
  readonly extraEssenceSlots: number;
  readonly milestoneName: string | null;
}

/**
 * Fator multiplicativo global. Combina parte linear + quadratica.
 * Aos +20, o fator e significativamente maior que a antiga formula linear.
 */
function factorForLevel(level: number): number {
  const cfg = BALANCE.enhancement;
  return 1 + level * cfg.powerFactorPerLevel + level * level * cfg.powerQuadraticFactor;
}

/**
 * Retorna os bonus completos de melhoramento para um item a um nivel.
 * Fonte unica de verdade - as funcoes antigas (enhancedPower/Attributes)
 * delegam nesta para manter compatibilidade.
 */
export function enhancementBonuses(item: ItemDefinition, level: number): EnhancementBonuses {
  if (level <= 0) {
    return {
      attackPower: 0, defensePower: 0, hp: 0,
      critChance: 0, critDamage: 0, hpRegen: 0, lifesteal: 0,
      strength: 0, agility: 0, intelligence: 0, vitality: 0, damageReduction: 0,
      extraRolls: 0, extraEssenceSlots: 0, milestoneName: null,
    };
  }

  const cfg = BALANCE.enhancement;
  const factor = factorForLevel(level);
  const attrs = item.attributeBonuses;
  const baseHp = Math.max(0, (attrs?.vitality ?? 0) * BALANCE.character.hpPerVitality);

  // Marcos acumulados ate ao nivel atual
  let extraRolls = 0;
  let extraEssenceSlots = 0;
  let milestoneName: string | null = null;
  const milestones = cfg.milestoneBonuses as Readonly<Record<number, { name: string; extraRolls: number; extraEssenceSlots: number }>>;
  for (const [raw, m] of Object.entries(milestones)) {
    const mark = Number(raw);
    if (level >= mark) {
      extraRolls += m.extraRolls;
      extraEssenceSlots += m.extraEssenceSlots;
      milestoneName = m.name;
    }
  }

  return {
    attackPower: Math.floor(item.attackPower * (factor - 1)),
    defensePower: Math.floor(item.defensePower * (factor - 1)),
    hp: Math.floor(baseHp * cfg.hpFactorPerLevel * level),
    critChance: cfg.critChancePerLevel * level,
    critDamage: cfg.critDamagePerLevel * level,
    hpRegen: cfg.hpRegenPerLevel * level,
    lifesteal: cfg.lifestealPerLevel * level,
    damageReduction: Math.min(cfg.damageReductionPerLevel * level, cfg.damageReductionMaxFromEnhancement),
    strength:     attrs ? Math.floor(attrs.strength     * cfg.attributeFactorPerLevel * level) : 0,
    agility:      attrs ? Math.floor(attrs.agility      * cfg.attributeFactorPerLevel * level) : 0,
    intelligence: attrs ? Math.floor(attrs.intelligence * cfg.attributeFactorPerLevel * level) : 0,
    vitality:     attrs ? Math.floor(attrs.vitality     * cfg.attributeFactorPerLevel * level) : 0,
    extraRolls,
    extraEssenceSlots,
    milestoneName,
  };
}

/**
 * Soma os bonus de melhoramento de varios itens.
 * Usado pelo game-services para agregar todo o equipamento equipado.
 */
export interface SummedEnhancementBonuses {
  readonly hp: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly hpRegen: number;
  readonly lifesteal: number;
  readonly damageReduction: number;
  readonly extraRolls: number;
  readonly extraEssenceSlots: number;
}

export function sumEnhancementBonuses(
  entries: readonly { item: ItemDefinition; level: number }[],
): SummedEnhancementBonuses {
  const acc = {
    hp: 0, critChance: 0, critDamage: 0, hpRegen: 0, lifesteal: 0, damageReduction: 0,
    extraRolls: 0, extraEssenceSlots: 0,
  };
  for (const e of entries) {
    const b = enhancementBonuses(e.item, e.level);
    acc.hp += b.hp;
    acc.critChance += b.critChance;
    acc.critDamage += b.critDamage;
    acc.hpRegen += b.hpRegen;
    acc.lifesteal += b.lifesteal;
    acc.damageReduction += b.damageReduction;
    acc.extraRolls += b.extraRolls;
    acc.extraEssenceSlots += b.extraEssenceSlots;
  }
  return acc;
}
/* ==================== API antiga (backward-compat) ==================== */

/** Bonus de AP/DP por nivel. Delega em enhancementBonuses. */
export function enhancedPower(item: ItemDefinition, level: number): PowerStats {
  const b = enhancementBonuses(item, level);
  return { attackPower: b.attackPower, defensePower: b.defensePower };
}

/** Bonus de atributos por nivel. Delega em enhancementBonuses. */
export function enhancedAttributes(item: ItemDefinition, level: number): Attributes {
  const b = enhancementBonuses(item, level);
  return { strength: b.strength, agility: b.agility, intelligence: b.intelligence, vitality: b.vitality };
}