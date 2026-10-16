import type { DerivedStats } from '../domain/attributes';
import type {
  SpecializationDefinition,
  SpecializationId,
  SpecializationState,
  SpecializationTreeDef,
} from '../domain/specializations/types';
import { emptySpecializationState } from '../domain/specializations/types';
import {
  activateSpec,
  applySpecializationModifiers,
  checkUnlock,
  deactivateSpec,
  findSpec,
  getActiveSpec,
} from '../domain/specializations/engine';
import type { UnlockCheck } from '../domain/specializations/engine';

export interface SpecializationView {
  readonly def: SpecializationDefinition;
  readonly active: boolean;
  readonly unlock: UnlockCheck;
}

export interface SpecializationsServiceOptions {
  readonly getCharacterLevel: () => number;
  readonly getTalentRank: (talentId: string) => number;
  readonly getSilver: () => number;
  readonly spendSilver: (amount: number) => boolean;
}

export const SWITCH_COST = 500;

export class SpecializationsService {
  private state: SpecializationState;

  constructor(
    private readonly tree: SpecializationTreeDef,
    private readonly opts: SpecializationsServiceOptions,
    initialState: SpecializationState = emptySpecializationState(),
  ) {
    this.state = initialState;
  }

  getState(): SpecializationState { return this.state; }
  setState(state: SpecializationState): void { this.state = state; }

  getActive(): SpecializationDefinition | null {
    return getActiveSpec(this.tree, this.state);
  }

  getActiveId(): SpecializationId | null {
    return this.state.active;
  }

  getActiveModifiers() {
    const active = this.getActive();
    return active?.modifiers ?? {};
  }

  canActivate(specId: SpecializationId): UnlockCheck {
    const spec = findSpec(this.tree, specId);
    if (!spec) return { ok: false, reason: 'unknown-spec', missingTalents: [] };
    return checkUnlock(spec, {
      characterLevel: this.opts.getCharacterLevel(),
      getTalentRank: this.opts.getTalentRank,
      activeSpec: this.getActive(),
    });
  }

  /**
   * Ativa especializacao. Se ja tem uma ativa diferente, cobra SWITCH_COST.
   * Se nao tem nenhuma ativa, e gratis.
   */
  activate(specId: SpecializationId, nowMs: number): { ok: boolean; reason: string | null; cost: number } {
    const check = this.canActivate(specId);
    if (!check.ok) {
      return { ok: false, reason: check.reason, cost: 0 };
    }
    const hadActive = this.state.active !== null;
    const cost = hadActive ? SWITCH_COST : 0;
    if (cost > 0) {
      if (this.opts.getSilver() < cost) return { ok: false, reason: 'not-enough-silver', cost };
      if (!this.opts.spendSilver(cost)) return { ok: false, reason: 'not-enough-silver', cost };
    }
    this.state = activateSpec(this.state, specId, nowMs);
    return { ok: true, reason: null, cost };
  }

  deactivate(nowMs: number): void {
    if (!this.state.active) return;
    this.state = deactivateSpec(this.state, nowMs);
  }

  applyModifiers(base: DerivedStats): DerivedStats {
    return applySpecializationModifiers(base, this.getActiveModifiers());
  }

  buildView(): readonly SpecializationView[] {
    const out: SpecializationView[] = [];
    for (const id of this.tree.order) {
      const def = findSpec(this.tree, id);
      if (!def) continue;
      const active = this.state.active === id;
      const unlock = this.canActivate(id);
      out.push({ def, active, unlock });
    }
    return out;
  }
}