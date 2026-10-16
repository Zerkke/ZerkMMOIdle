import type {
  TalentBonusBundle,
  TalentDefinition,
  TalentState,
  TalentTreeDef,
} from '../domain/talents/types';
import { emptyTalentState } from '../domain/talents/types';
import {
  canLearn,
  getBonuses,
  getRank,
  learn,
  resetTalents,
  totalPointsSpent,
} from '../domain/talents/engine';
import type { CanLearnResult } from '../domain/talents/engine';

export interface TalentNodeView {
  readonly def: TalentDefinition;
  readonly rank: number;
  readonly canLearnResult: CanLearnResult;
  readonly prerequisitesOk: boolean;
}

export interface TalentBranchView {
  readonly branch: string;
  readonly label: string;
  readonly color: string;
  readonly nodes: readonly TalentNodeView[];
}

export interface TalentTreeView {
  readonly branches: readonly TalentBranchView[];
  readonly availablePoints: number;
  readonly spentPoints: number;
  readonly respecCount: number;
  readonly respecCost: number;
}

export interface TalentsServiceOptions {
  readonly getCharacterLevel: () => number;
  readonly getProgressionPoints: () => number;
  readonly getSilver: () => number;
  readonly spendSilver: (amount: number) => boolean;
}

export class TalentsService {
  private state: TalentState;

  constructor(
    private readonly tree: TalentTreeDef,
    private readonly opts: TalentsServiceOptions,
    initialState: TalentState = emptyTalentState(),
  ) {
    this.state = initialState;
  }

  getState(): TalentState { return this.state; }
  setState(state: TalentState): void { this.state = state; }

  getAvailablePoints(): number {
    return Math.max(0, this.opts.getProgressionPoints() - totalPointsSpent(this.state, this.tree.talents));
  }

  getSpentPoints(): number {
    return totalPointsSpent(this.state, this.tree.talents);
  }

  getRank(talentId: string): number {
    return getRank(this.state, talentId);
  }

  getBonuses(): TalentBonusBundle {
    return getBonuses(this.state, this.tree.talents);
  }

  getRespecCost(): number {
    const n = this.state.respecCount;
    return 100 * (n + 1) * (n + 2);
  }

  canLearn(talentId: string): CanLearnResult {
    return canLearn(
      this.state,
      talentId,
      this.tree.talents,
      this.getAvailablePoints(),
      this.opts.getCharacterLevel(),
    );
  }

  spend(talentId: string): boolean {
    const after = learn(
      this.state,
      talentId,
      this.tree.talents,
      this.getAvailablePoints(),
      this.opts.getCharacterLevel(),
    );
    if (!after) return false;
    this.state = after;
    return true;
  }

  respec(): { ok: boolean; cost: number } {
    const cost = this.getRespecCost();
    if (this.opts.getSilver() < cost) return { ok: false, cost };
    if (!this.opts.spendSilver(cost)) return { ok: false, cost };
    this.state = resetTalents(this.state);
    return { ok: true, cost };
  }

  buildView(): TalentTreeView {
    const branches: TalentBranchView[] = [];
    for (const branch of this.tree.branchOrder) {
      const nodes: TalentNodeView[] = [];
      for (const def of this.tree.talents) {
        if (def.branch !== branch) continue;
        const rank = this.getRank(def.id);
        const can = this.canLearn(def.id);
        const prerequisitesOk = def.prerequisites.every((p) => this.getRank(p) > 0);
        nodes.push({ def, rank, canLearnResult: can, prerequisitesOk });
      }
      branches.push({
        branch,
        label: this.tree.branchLabels[branch],
        color: this.tree.branchColors[branch],
        nodes,
      });
    }
    return {
      branches,
      availablePoints: this.getAvailablePoints(),
      spentPoints: this.getSpentPoints(),
      respecCount: this.state.respecCount,
      respecCost: this.getRespecCost(),
    };
  }
}