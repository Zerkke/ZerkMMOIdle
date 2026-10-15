export type TabId =
  | 'sheet' | 'character' | 'combat' | 'inventory' | 'equipment' | 'enhancement'
  | 'lifeskills' | 'agriculture' | 'crafting' | 'cooking'
  | 'idle' | 'warehouse' | 'shop' | 'economy'
  | 'world' | 'quests' | 'account';

export interface TabDefinition { readonly id: TabId; readonly label: string; }

export const TABS: readonly TabDefinition[] = [
  { id: 'character', label: 'Personagem' },
  { id: 'sheet', label: 'Ficha' },
  { id: 'combat', label: 'Combate' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'equipment', label: 'Equipamento' },
  { id: 'enhancement', label: 'Melhoramentos' },
  { id: 'lifeskills', label: 'Lifeskills' },
  { id: 'agriculture', label: 'Agricultura' },
  { id: 'crafting', label: 'Crafting' },
  { id: 'cooking', label: 'Cozinha' },
  { id: 'idle', label: 'Idle' },
  { id: 'warehouse', label: 'Armazem' },
  { id: 'shop', label: 'Loja' },
  { id: 'economy', label: 'Economia' },
  { id: 'world', label: 'Mundo' },
  { id: 'quests', label: 'Missoes' },
  { id: 'account', label: 'Conta' },
];

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