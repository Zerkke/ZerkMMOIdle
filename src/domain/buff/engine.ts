import type { BuffId } from '../ids';
import type { BuffDefinition, ActiveBuff, ApplyResult, BuffKind } from './types';
import { MAX_ACTIVE_BUFFS } from './types';

export class BuffManager {
  private buffs: ActiveBuff[] = [];

  apply(def: BuffDefinition, nowMs: number): ApplyResult {
    const existing = this.buffs.find((b) => b.buffId === def.id);
    if (existing) {
      this.buffs = this.buffs.map((b) =>
        b.buffId === def.id
          ? { ...b, magnitude: def.magnitude, appliedAt: nowMs, expiresAt: nowMs + def.durationMs }
          : b,
      );
      return { applied: true, refreshed: true, reason: null };
    }
    if (this.buffs.length >= MAX_ACTIVE_BUFFS) {
      return { applied: false, refreshed: false, reason: `Limite de ${MAX_ACTIVE_BUFFS} buffs ativos.` };
    }
    this.buffs.push({
      buffId: def.id,
      kind: def.kind,
      magnitude: def.magnitude,
      appliedAt: nowMs,
      expiresAt: nowMs + def.durationMs,
    });
    return { applied: true, refreshed: false, reason: null };
  }

  tick(nowMs: number): readonly BuffId[] {
    const expired: BuffId[] = [];
    this.buffs = this.buffs.filter((b) => {
      if (b.expiresAt <= nowMs) { expired.push(b.buffId); return false; }
      return true;
    });
    return expired;
  }

  list(): readonly ActiveBuff[] { return this.buffs.slice(); }
  has(id: BuffId): boolean { return this.buffs.some((b) => b.buffId === id); }
  clear(): void { this.buffs = []; }

  modifier(kind: BuffKind): number {
    let total = 0;
    for (const b of this.buffs) if (b.kind === kind) total += b.magnitude;
    return total;
  }

  toSnapshot(): readonly ActiveBuff[] { return this.buffs.slice(); }

  static fromSnapshot(snapshot: readonly ActiveBuff[], nowMs: number): BuffManager {
    const m = new BuffManager();
    for (const b of snapshot) {
      if (b.expiresAt > nowMs) m.buffs.push({ ...b });
    }
    return m;
  }
}