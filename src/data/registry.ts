import type { ClassId, ItemId, MonsterId, NodeId, ProfessionId, RecipeId, SkillId, ZoneId, BuffId } from '../domain/ids';
import type { CharacterClass, ItemDefinition, MonsterDefinition, SkillDefinition, ZoneDefinition } from '../domain/content';
import { isEquippable, isTool } from '../domain/content';
import type { EnhancementRule } from '../domain/enhancement/types';
import type { GatheringNode, ProfessionDefinition, Recipe } from '../domain/lifeskill/types';
import type { BuffDefinition } from '../domain/buff/types';
import { ValidationResult, isNonEmptyString, isNonNegativeInt, isPositiveInt, isUnitInterval } from '../domain/validation';
import { DEMO_CLASSES, DEMO_ITEMS, DEMO_MONSTERS, DEMO_ZONES } from './demo-content';
import { DEMO_SKILLS } from './skills.data';
import { ENHANCEMENT_RULES } from './enhancement.data';
import { DEMO_PROFESSIONS } from './professions.data';
import { DEMO_NODES } from './nodes.data';
import { DEMO_RECIPES } from './recipes.data';
import { DEMO_BUFFS } from './buffs.data';

export interface ContentRegistry {
  readonly items: ReadonlyMap<ItemId, ItemDefinition>;
  readonly classes: ReadonlyMap<ClassId, CharacterClass>;
  readonly monsters: ReadonlyMap<MonsterId, MonsterDefinition>;
  readonly zones: ReadonlyMap<ZoneId, ZoneDefinition>;
  readonly skills: ReadonlyMap<SkillId, SkillDefinition>;
  readonly enhancementRules: readonly EnhancementRule[];
  readonly professions: ReadonlyMap<ProfessionId, ProfessionDefinition>;
  readonly nodes: ReadonlyMap<NodeId, GatheringNode>;
  readonly recipes: ReadonlyMap<RecipeId, Recipe>;
  readonly buffs: ReadonlyMap<BuffId, BuffDefinition>;
  getItem(id: ItemId): ItemDefinition | undefined;
  getClass(id: ClassId): CharacterClass | undefined;
  getMonster(id: MonsterId): MonsterDefinition | undefined;
  getZone(id: ZoneId): ZoneDefinition | undefined;
  getSkill(id: SkillId): SkillDefinition | undefined;
  getEnhancementRule(category: string): EnhancementRule | undefined;
  getProfession(id: ProfessionId): ProfessionDefinition | undefined;
  getNode(id: NodeId): GatheringNode | undefined;
  getRecipe(id: RecipeId): Recipe | undefined;
  getBuff(id: BuffId): BuffDefinition | undefined;
}

export interface ContentInput {
  readonly items: readonly ItemDefinition[];
  readonly classes: readonly CharacterClass[];
  readonly monsters: readonly MonsterDefinition[];
  readonly zones: readonly ZoneDefinition[];
  readonly skills: readonly SkillDefinition[];
  readonly enhancementRules?: readonly EnhancementRule[];
  readonly professions: readonly ProfessionDefinition[];
  readonly nodes: readonly GatheringNode[];
  readonly recipes: readonly Recipe[];
  readonly buffs: readonly BuffDefinition[];
}

function buildMap<T extends { readonly id: string }>(list: readonly T[], result: ValidationResult, label: string): Map<T['id'], T> {
  const map = new Map<T['id'], T>();
  for (const e of list) {
    if (map.has(e.id)) { result.add(`${label}.${e.id}`, 'ID duplicado'); continue; }
    map.set(e.id, e);
  }
  return map;
}

export function buildContentRegistry(input: ContentInput): ContentRegistry {
  const result = new ValidationResult();
  const items = buildMap(input.items, result, 'item');
  const classes = buildMap(input.classes, result, 'class');
  const monsters = buildMap(input.monsters, result, 'monster');
  const zones = buildMap(input.zones, result, 'zone');
  const skills = buildMap(input.skills, result, 'skill');
  const professions = buildMap(input.professions, result, 'profession');
  const nodes = buildMap(input.nodes, result, 'node');
  const recipes = buildMap(input.recipes, result, 'recipe');
  const buffs = buildMap(input.buffs, result, 'buff');
  const rules = input.enhancementRules ?? [];

  /* Items */
  for (const item of items.values()) {
    const base = `item.${item.id}`;
    if (!isNonEmptyString(item.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(item.maxStack)) result.add(`${base}.maxStack`, 'invalido');
    if (!isNonNegativeInt(item.sellPrice)) result.add(`${base}.sellPrice`, 'invalido');
    const equippable = isEquippable(item);
    const needsSlot = item.category === 'weapon' || item.category === 'armor' || item.category === 'accessory' || item.category === 'tool';
    if (needsSlot && !equippable) result.add(`${base}.equipSlot`, 'Equipavel sem slot');
    if (equippable && item.maxStack !== 1) result.add(`${base}.maxStack`, 'Equipavel maxStack=1');
    if (isTool(item) && item.maxDurability <= 0) result.add(`${base}.maxDurability`, 'Ferramenta sem durabilidade');
    if (item.appliesBuffId && !buffs.has(item.appliesBuffId)) result.add(`${base}.appliesBuffId`, `Buff inexistente: ${item.appliesBuffId}`);
    if (item.seedForNodeId && !nodes.has(item.seedForNodeId)) result.add(`${base}.seedForNodeId`, `Node inexistente: ${item.seedForNodeId}`);
  }

  /* Profissoes */
  for (const p of professions.values()) {
    const base = `profession.${p.id}`;
    if (!isNonEmptyString(p.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(p.maxLevel)) result.add(`${base}.maxLevel`, 'invalido');
  }

  /* Nodes */
  for (const n of nodes.values()) {
    const base = `node.${n.id}`;
    if (!professions.has(n.professionId)) result.add(`${base}.professionId`, 'Profissao inexistente');
    if (!zones.has(n.zoneId)) result.add(`${base}.zoneId`, 'Zona inexistente');
    if (!isPositiveInt(n.baseTimeMs)) result.add(`${base}.baseTimeMs`, 'invalido');
    for (const l of n.loot) {
      if (!items.has(l.itemId)) result.add(`${base}.loot`, `Item inexistente: ${l.itemId}`);
      if (!isUnitInterval(l.chance)) result.add(`${base}.loot.chance`, 'invalido');
    }
  }

  /* Receitas */
  for (const r of recipes.values()) {
    const base = `recipe.${r.id}`;
    if (!professions.has(r.professionId)) result.add(`${base}.professionId`, 'Inexistente');
    if (r.inputs.length === 0) result.add(`${base}.inputs`, 'Sem inputs');
    if (r.outputs.length === 0) result.add(`${base}.outputs`, 'Sem outputs');
    for (const i of r.inputs) if (!items.has(i.itemId)) result.add(`${base}.inputs`, `Item inexistente: ${i.itemId}`);
    for (const o of r.outputs) if (!items.has(o.itemId)) result.add(`${base}.outputs`, `Item inexistente: ${o.itemId}`);
  }

  /* Buffs */
  for (const b of buffs.values()) {
    const base = `buff.${b.id}`;
    if (!isNonEmptyString(b.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(b.durationMs)) result.add(`${base}.durationMs`, 'invalido');
    if (typeof b.magnitude !== 'number' || b.magnitude <= 0) result.add(`${base}.magnitude`, 'invalido');
    if (b.sourceItemId && !items.has(b.sourceItemId)) result.add(`${base}.sourceItemId`, 'Item inexistente');
  }

  /* Enhancement rules */
  for (const rule of rules) {
    if (rule.levels.length === 0) result.add(`rule.${rule.category}`, 'Sem niveis');
  }

  /* Classes */
  for (const cls of classes.values()) {
    const base = `class.${cls.id}`;
    if (!isNonEmptyString(cls.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(cls.baseHp)) result.add(`${base}.baseHp`, 'invalido');
    for (const sid of cls.skillIds) if (!skills.has(sid)) result.add(`${base}.skillIds`, `Skill inexistente: ${sid}`);
  }

  /* Monstros / Bosses */
  for (const m of monsters.values()) {
    const base = `monster.${m.id}`;
    if (!isNonEmptyString(m.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(m.level)) result.add(`${base}.level`, 'invalido');
    if (!isPositiveInt(m.maxHp)) result.add(`${base}.maxHp`, 'invalido');
    if (m.isBoss && m.bossTier < 1) result.add(`${base}.bossTier`, 'Boss sem tier >= 1');
    if (!m.isBoss && m.bossTier !== 0) result.add(`${base}.bossTier`, 'Nao-boss deve ter tier 0');
    for (const e of m.loot) if (!items.has(e.itemId)) result.add(`${base}.loot`, `Item inexistente: ${e.itemId}`);
  }

  /* Zonas */
  for (const z of zones.values()) {
    const base = `zone.${z.id}`;
    if (!isNonEmptyString(z.name)) result.add(`${base}.name`, 'Nome vazio');
    if (!isPositiveInt(z.minLevel)) result.add(`${base}.minLevel`, 'invalido');
    for (const mid of z.monsters) {
      if (!monsters.has(mid)) result.add(`${base}.monsters`, `Monstro inexistente: ${mid}`);
    }
    for (const aid of z.activities) {
      if (!professions.has(aid as ProfessionId)) result.add(`${base}.activities`, `Profissao inexistente: ${aid}`);
    }
    if (z.parentZoneId !== null && !zones.has(z.parentZoneId)) {
      result.add(`${base}.parentZoneId`, `Zona pai inexistente: ${z.parentZoneId}`);
    }
    if (z.bossId !== null) {
      const boss = monsters.get(z.bossId);
      if (!boss) result.add(`${base}.bossId`, `Boss inexistente: ${z.bossId}`);
      else if (!boss.isBoss) result.add(`${base}.bossId`, 'bossId aponta para um monstro nao-boss');
    }
    if (z.kind === 'boss' && z.bossId === null) result.add(`${base}.bossId`, 'Zona boss sem bossId');
  }

  result.throwIfInvalid();

  return {
    items, classes, monsters, zones, skills, professions, nodes, recipes, buffs,
    enhancementRules: rules,
    getItem: (id) => items.get(id),
    getClass: (id) => classes.get(id),
    getMonster: (id) => monsters.get(id),
    getZone: (id) => zones.get(id),
    getSkill: (id) => skills.get(id),
    getEnhancementRule: (cat) => rules.find((r) => r.category === cat),
    getProfession: (id) => professions.get(id),
    getNode: (id) => nodes.get(id),
    getRecipe: (id) => recipes.get(id),
    getBuff: (id) => buffs.get(id),
  };
}

export function createDemoRegistry(): ContentRegistry {
  return buildContentRegistry({
    items: DEMO_ITEMS, classes: DEMO_CLASSES, monsters: DEMO_MONSTERS, zones: DEMO_ZONES,
    skills: DEMO_SKILLS, enhancementRules: ENHANCEMENT_RULES,
    professions: DEMO_PROFESSIONS, nodes: DEMO_NODES, recipes: DEMO_RECIPES, buffs: DEMO_BUFFS,
  });
}