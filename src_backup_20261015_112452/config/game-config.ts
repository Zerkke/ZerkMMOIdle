export const GAME_CONFIG = {
  name: 'Zerk Idle MMORPG',
  version: '0.2.1',
  phase: 'Fase 12 - Visual Polish',
  width: 960,
  height: 540,
  colors: {
    background: 0x0d0a1a,
    accent: 0xd4a24e,
    text: 0xe8e0f0,
  },
} as const;

export type GameConfig = typeof GAME_CONFIG;