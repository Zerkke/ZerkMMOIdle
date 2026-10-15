/**
 * Mapa de eventos da aplicacao. Cada evento tem payload tipado.
 * Eventos so devem existir quando ha comunicacao real entre modulos.
 */
export type AppEventMap = {
  'game:ready': { timestamp: number };
  'game:paused': { reason: string };
  'game:resumed': { timestamp: number };
  'content:loaded': { items: number; classes: number; monsters: number; zones: number };
  'ui:tab-changed': { tab: string };
  'character:updated': {
    level: number;
    experience: number;
    experienceToNext: number;
    silver: number;
  };
};