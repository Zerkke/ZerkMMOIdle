import type { Attributes, PowerStats } from '../attributes';
import type { ItemDefinition } from '../content';
import { BALANCE } from '../../data/balance.config';

/** Bonus de AP/DP por nivel de melhoramento. */
export function enhancedPower(item: ItemDefinition, level: number): PowerStats {
  const factor = 1 + level * BALANCE.enhancement.powerFactorPerLevel;
  return {
    attackPower: Math.floor(item.attackPower * factor),
    defensePower: Math.floor(item.defensePower * factor),
  };
}

/** Bonus de atributos por nivel de melhoramento. */
export function enhancedAttributes(item: ItemDefinition, level: number): Attributes {
  if (!item.attributeBonuses) {
    return { strength: 0, agility: 0, intelligence: 0, vitality: 0 };
  }
  const factor = 1 + level * BALANCE.enhancement.attributeFactorPerLevel;
  return {
    strength: Math.floor(item.attributeBonuses.strength * factor),
    agility: Math.floor(item.attributeBonuses.agility * factor),
    intelligence: Math.floor(item.attributeBonuses.intelligence * factor),
    vitality: Math.floor(item.attributeBonuses.vitality * factor),
  };
}