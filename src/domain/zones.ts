// src/domain/zones.ts
// Escala de dano por AP/DP em vez de bloqueio. Funcao pura, testavel.

import type { ZoneDefinition } from './content';

export type ZoneScalingStatus =
  | 'overpowered'
  | 'strong'
  | 'ok'
  | 'weak'
  | 'severely-weak';

export interface ZoneScalingResult {
  readonly status: ZoneScalingStatus;
  /** Multiplicador do dano que o jogador causa (<1 penaliza, >1 bonus). */
  readonly damageDealtMult: number;
  /** Multiplicador do dano que o jogador recebe (>1 penaliza, <1 bonus). */
  readonly damageTakenMult: number;
  readonly ratioAp: number;
  readonly ratioDp: number;
  readonly ratioMedio: number;
  readonly requiredAp: number;
  readonly requiredDp: number;
  readonly playerAp: number;
  readonly playerDp: number;
  readonly description: string;
}

type ZoneReq = Pick<ZoneDefinition, 'requiredAp' | 'requiredDp'>;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function statusLabel(s: ZoneScalingStatus, dealt: number, taken: number): string {
  const d = dealt.toFixed(2);
  const t = taken.toFixed(2);
  switch (s) {
    case 'overpowered':   return 'Sobrepoderoso - dano x' + d + ', recebido x' + t;
    case 'strong':        return 'Bem equipado - dano x' + d + ', recebido x' + t;
    case 'ok':            return 'Equilibrado';
    case 'weak':          return 'Subequipado - dano x' + d + ', recebido x' + t;
    case 'severely-weak': return 'MUITO subequipado - dano x' + d + ', recebido x' + t;
  }
}

/**
 * Calcula a escala de dano por zona com base em AP/DP do jogador.
 * Nunca bloqueia - sempre devolve multiplicadores.
 *
 * - Zona sem requisitos -> tudo 1.0 (sem escala).
 * - ratioMedio = min(playerAp/reqAp, playerDp/reqDp).
 * - damageDealtMult = clamp(ratioMedio, 0.4, 2.0).
 * - damageTakenMult = clamp(1.0/ratioMedio, 0.5, 2.5).
 */
export function computeZoneScaling(
  playerAp: number,
  playerDp: number,
  zone: ZoneReq,
): ZoneScalingResult {
  const reqAp = zone.requiredAp ?? 0;
  const reqDp = zone.requiredDp ?? 0;

  if (reqAp === 0 && reqDp === 0) {
    return {
      status: 'ok',
      damageDealtMult: 1,
      damageTakenMult: 1,
      ratioAp: 1, ratioDp: 1, ratioMedio: 1,
      requiredAp: 0, requiredDp: 0,
      playerAp, playerDp,
      description: 'Zona sem requisitos',
    };
  }

  const ratioAp = reqAp > 0 ? playerAp / reqAp : Infinity;
  const ratioDp = reqDp > 0 ? playerDp / reqDp : Infinity;
  const ratioMedio = Math.min(ratioAp, ratioDp);

  const damageDealtMult = clamp(ratioMedio, 0.4, 2.0);
  const damageTakenMult = clamp(1.0 / Math.max(ratioMedio, 0.1), 0.5, 2.5);

  let status: ZoneScalingStatus;
  if (ratioMedio >= 2.0) status = 'overpowered';
  else if (ratioMedio >= 1.2) status = 'strong';
  else if (ratioMedio >= 0.9) status = 'ok';
  else if (ratioMedio >= 0.6) status = 'weak';
  else status = 'severely-weak';

  return {
    status,
    damageDealtMult,
    damageTakenMult,
    ratioAp, ratioDp, ratioMedio,
    requiredAp: reqAp, requiredDp: reqDp,
    playerAp, playerDp,
    description: statusLabel(status, damageDealtMult, damageTakenMult),
  };
}

/**
 * API de compatibilidade. Nunca bloqueia â€” devolve sempre ok.
 * Os multiplicadores estao disponiveis em computeZoneScaling.
 */
export function checkZoneAccess(
  playerAp: number,
  playerDp: number,
  zone: ZoneReq,
): { ok: boolean; reason: string | null; scaling: ZoneScalingResult } {
  const scaling = computeZoneScaling(playerAp, playerDp, zone);
  return { ok: true, reason: null, scaling };
}