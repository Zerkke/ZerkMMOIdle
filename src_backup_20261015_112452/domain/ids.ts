export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ItemId = Brand<string, 'ItemId'>;
export type ClassId = Brand<string, 'ClassId'>;
export type MonsterId = Brand<string, 'MonsterId'>;
export type ZoneId = Brand<string, 'ZoneId'>;
export type SkillId = Brand<string, 'SkillId'>;
export type ProfessionId = Brand<string, 'ProfessionId'>;
export type NodeId = Brand<string, 'NodeId'>;
export type RecipeId = Brand<string, 'RecipeId'>;
export type BuffId = Brand<string, 'BuffId'>;
export type QuestId = Brand<string, 'QuestId'>;

export function asItemId(v: string): ItemId { return v as ItemId; }
export function asClassId(v: string): ClassId { return v as ClassId; }
export function asMonsterId(v: string): MonsterId { return v as MonsterId; }
export function asZoneId(v: string): ZoneId { return v as ZoneId; }
export function asSkillId(v: string): SkillId { return v as SkillId; }
export function asProfessionId(v: string): ProfessionId { return v as ProfessionId; }
export function asNodeId(v: string): NodeId { return v as NodeId; }
export function asRecipeId(v: string): RecipeId { return v as RecipeId; }
export function asBuffId(v: string): BuffId { return v as BuffId; }
export function asQuestId(v: string): QuestId { return v as QuestId; }