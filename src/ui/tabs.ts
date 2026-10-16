import type { IconName } from './icons';

export type TabId =
  | 'sheet' | 'character' | 'combat' | 'inventory' | 'equipment' | 'enhancement'
  | 'lifeskills' | 'agriculture' | 'crafting' | 'cooking'
  | 'idle' | 'warehouse' | 'shop' | 'economy'
  | 'world' | 'quests' | 'account' | 'talents' | 'specializations'
  | 'dungeons' | 'arena';

export interface TabDefinition {
  readonly id: TabId;
  readonly label: string;
  readonly icon: IconName;
}

export interface TabGroup {
  readonly label: string;
  readonly tabs: readonly TabDefinition[];
}

export const TAB_GROUPS: readonly TabGroup[] = [
  {
    label: 'Personagem',
    tabs: [
      { id: 'character', label: 'Personagem', icon: 'user' },
      { id: 'sheet', label: 'Ficha', icon: 'scroll' },
      { id: 'equipment', label: 'Equipamento', icon: 'armor' },
      { id: 'inventory', label: 'Inventario', icon: 'briefcase' },
      { id: 'warehouse', label: 'Armazem', icon: 'chest' },
    ],
  },
  {
    label: 'Progressao',
    tabs: [
      { id: 'talents', label: 'Talentos', icon: 'sparkles' },
      { id: 'specializations', label: 'Especializacoes', icon: 'flame' },
      { id: 'quests', label: 'Missoes', icon: 'scroll' },
    ],
  },
  {
    label: 'Combate',
    tabs: [
      { id: 'combat', label: 'Combate', icon: 'swords' },
      { id: 'dungeons', label: 'Dungeons', icon: 'flame' },
      { id: 'arena', label: 'Arena', icon: 'level-up' },
      { id: 'enhancement', label: 'Melhoramentos', icon: 'anvil' },
    ],
  },
  {
    label: 'Lifeskills',
    tabs: [
      { id: 'lifeskills', label: 'Lifeskills', icon: 'pickaxe' },
      { id: 'agriculture', label: 'Agricultura', icon: 'wheat' },
      { id: 'crafting', label: 'Crafting', icon: 'anvil' },
      { id: 'cooking', label: 'Cozinha', icon: 'bowl' },
    ],
  },
  {
    label: 'Economia',
    tabs: [
      { id: 'shop', label: 'Loja', icon: 'cart' },
      { id: 'economy', label: 'Economia', icon: 'coin' },
      { id: 'idle', label: 'Idle', icon: 'hourglass' },
    ],
  },
  {
    label: 'Mundo',
    tabs: [
      { id: 'world', label: 'Mundo', icon: 'home' },
      { id: 'account', label: 'Conta', icon: 'user' },
    ],
  },
];

/** Lista plana de tabs (compat) — derivada dos grupos. */
export const TABS: readonly TabDefinition[] = TAB_GROUPS.flatMap((g) => g.tabs);

export class TabController {
  private active: TabId = 'character';
  private readonly listeners = new Set<(tab: TabId) => void>();

  activate(tab: TabId): void {
    if (tab === this.active) return;
    this.active = tab;
    for (const l of this.listeners) l(tab);
  }

  current(): TabId { return this.active; }

  onChange(listener: (tab: TabId) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}