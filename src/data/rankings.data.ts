import type { RewardTable } from '../domain/rankings/engine';

export const SEASON_REWARD_TABLE: RewardTable = {
  silverByTier: { bronze: 500, silver: 2500, gold: 10000, platinum: 40000, diamond: 120000 },
  xpByTier: { bronze: 200, silver: 1000, gold: 4000, platinum: 15000, diamond: 40000 },
  bonusTop10: 20000,
  bonusTop3: 80000,
  bonusRank1: 250000,
};