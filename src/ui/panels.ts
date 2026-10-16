import type { ContentRegistry } from '../data/registry';
import type { GameServices } from '../services/game-services';
import { renderCharacterPanel } from './character-panel';
import { renderInventoryPanel } from './inventory-panel';
import { renderEquipmentPanel } from './equipment-panel';
import { renderCharacterSheet } from './character-sheet';
import { renderCombatPanel } from './combat-panel';
import { renderEnhancementPanel } from './enhancement-panel';
import { renderLifeskillPanel } from './lifeskill-panel';
import { renderCraftingPanel, renderCookingPanel } from './crafting-panel';
import { renderAgriculturePanel } from './agriculture-panel';
import { renderWarehousePanel } from './warehouse-panel';
import { renderNpcShopPanel } from './npc-shop-panel';
import { renderMetricsPanel } from './metrics-panel';
import { renderIdlePanel } from './idle-panel';
import { renderQuestsPanel } from './quests-panel';
import { renderAccountPanel } from './account-panel';
import { renderTalentsPanel } from './talents-panel';
import { renderSpecializationsPanel } from './specializations-panel';
import { renderDungeonsPanel } from './dungeons-panel';
import { renderArenaPanel } from './arena-panel';

export function renderWorldPanel(registry: ContentRegistry): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';
  const header = document.createElement('h2');
  header.textContent = 'Mundo';
  root.appendChild(header);
  if (registry.zones.size === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-state panel-state--empty';
    empty.textContent = 'Nenhuma zona disponivel.';
    root.appendChild(empty);
    return root;
  }
  for (const zone of registry.zones.values()) {
    const card = document.createElement('div');
    card.className = 'zone-card';
    const name = document.createElement('h3');
    name.textContent = zone.name + ' (Nivel minimo ' + zone.minLevel + ')';
    card.appendChild(name);
    const desc = document.createElement('p');
    desc.textContent = zone.description;
    card.appendChild(desc);
    const list = document.createElement('ul');
    list.className = 'monster-list';
    for (const mid of zone.monsters) {
      const m = registry.getMonster(mid);
      const li = document.createElement('li');
      li.textContent = m ? m.name + ' (Nv. ' + m.level + ') - ' + m.expReward + ' XP, ' + m.silverReward + ' prata' : mid;
      list.appendChild(li);
    }
    card.appendChild(list);
    root.appendChild(card);
  }
  return root;
}

export const PANEL_RENDERERS = {
  sheet: (services: GameServices) => renderCharacterSheet(services),
  character: (services: GameServices) => renderCharacterPanel(services),
  combat: (services: GameServices) => renderCombatPanel(services),
  inventory: (services: GameServices) => renderInventoryPanel(services),
  equipment: (services: GameServices) => renderEquipmentPanel(services),
  enhancement: (services: GameServices) => renderEnhancementPanel(services),
  lifeskills: (services: GameServices) => renderLifeskillPanel(services),
  agriculture: (services: GameServices) => renderAgriculturePanel(services),
  crafting: (services: GameServices) => renderCraftingPanel(services),
  cooking: (services: GameServices) => renderCookingPanel(services),
  idle: (services: GameServices) => renderIdlePanel(services),
  warehouse: (services: GameServices) => renderWarehousePanel(services),
  shop: (services: GameServices) => renderNpcShopPanel(services),
  economy: (services: GameServices) => renderMetricsPanel(services),
  world: (_s: GameServices, registry: ContentRegistry) => renderWorldPanel(registry),
  quests: (services: GameServices) => renderQuestsPanel(services),
  account: (services: GameServices) => renderAccountPanel(services),
  talents: (services: GameServices) => renderTalentsPanel(services),
  specializations: (services: GameServices) => renderSpecializationsPanel(services),
  dungeons: (services: GameServices) => renderDungeonsPanel(services),
  arena: (services: GameServices) => renderArenaPanel(services),
} as const;