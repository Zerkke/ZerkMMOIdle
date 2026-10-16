const fs = require('fs');
const PATH = 'src/services/game-services.ts';
let c = fs.readFileSync(PATH, 'utf8');
const CRLF = c.includes('\r\n');
c = c.replace(/\r\n/g, '\n');

const J = (arr) => arr.join('\n');

const steps = [
  {
    label: 'imports',
    old: "import { SPECIALIZATION_TREE } from '../data/specializations.data';",
    new: J([
      "import { SPECIALIZATION_TREE } from '../data/specializations.data';",
      "import { DungeonsService } from './dungeons-service';",
      "import { DUNGEONS } from '../data/dungeons.data';",
      "import type { DungeonsState } from '../domain/dungeons/types';",
      "import type { DungeonDefinition } from '../domain/dungeons/types';",
    ]),
  },
  {
    label: 'ServiceEvent dungeon-changed',
    old: "  | { readonly type: 'specialization-changed' }",
    new: J([
      "  | { readonly type: 'specialization-changed' }",
      "  | { readonly type: 'dungeon-changed' }",
    ]),
  },
  {
    label: 'campo dungeonsService',
    old: "  private readonly specializationsService: SpecializationsService;",
    new: J([
      "  private readonly specializationsService: SpecializationsService;",
      "  private readonly dungeonsService: DungeonsService;",
    ]),
  },
  {
    label: 'constructor dungeonsService',
    old: "    this.ensureAllProfessions();",
    new: J([
      "    const dungeonsInitial: DungeonsState = save.dungeons",
      "      ? {",
      "          active: save.dungeons.active ? { ...save.dungeons.active } : null,",
      "          results: Object.fromEntries(Object.entries(save.dungeons.results).map(([k, v]) => [k, { ...v }])),",
      "        }",
      "      : { active: null, results: {} };",
      "    this.dungeonsService = new DungeonsService(",
      "      DUNGEONS,",
      "      {",
      "        getCharacterLevel: () => this.character.level,",
      "        getAp: () => this.getDerivedStats().ap,",
      "        getDp: () => this.getDerivedStats().dp,",
      "        getSilver: () => this.character.silver,",
      "        spendSilver: (amount: number) => {",
      "          if (this.character.silver < amount) return false;",
      "          this.character = { ...this.character, silver: this.character.silver - amount };",
      "          return true;",
      "        },",
      "      },",
      "      dungeonsInitial,",
      "    );",
      "    this.ensureAllProfessions();",
    ]),
  },
  {
    label: 'metodos startDungeon/abandonDungeon',
    old: "  getSpecializationsService(): SpecializationsService { return this.specializationsService; }",
    new: J([
      "  getSpecializationsService(): SpecializationsService { return this.specializationsService; }",
      "  getDungeonsService(): DungeonsService { return this.dungeonsService; }",
      "  startDungeon(dungeonId: string): boolean {",
      "    if (this.combatState) { this.emit({ type: 'notice', message: 'Termina o combate atual primeiro.', level: 'warn' }); return false; }",
      "    if (this.activity) { this.emit({ type: 'notice', message: 'Termina a atividade atual primeiro.', level: 'warn' }); return false; }",
      "    const r = this.dungeonsService.start(dungeonId, Date.now());",
      "    if (!r.ok) {",
      "      const reasonMap: Record<string, string> = {",
      "        'unknown-dungeon': 'Dungeon desconhecida.',",
      "        'already-active': 'Ja tens uma dungeon ativa.',",
      "        'level-too-low': 'Nivel insuficiente.',",
      "        'not-enough-silver': 'Prata insuficiente.',",
      "      };",
      "      this.emit({ type: 'notice', message: reasonMap[r.reason ?? ''] ?? 'Nao foi possivel iniciar.', level: 'warn' });",
      "      return false;",
      "    }",
      "    this.currentZoneId = null;",
      "    this.currentZoneScaling = null;",
      "    this.sessionKills = 0; this.sessionXp = 0; this.sessionSilver = 0;",
      "    this.sessionLoot = new Map(); this.combatLog = []; this.pausedUntilMs = 0;",
      "    this.spawnNextMonster(Date.now());",
      "    this.emit({ type: 'dungeon-changed' });",
      "    this.emit({ type: 'combat-changed' });",
      "    return true;",
      "  }",
      "  abandonDungeon(): void {",
      "    if (!this.dungeonsService.isActive()) return;",
      "    this.dungeonsService.abandon();",
      "    this.stopCombat();",
      "    this.emit({ type: 'dungeon-changed' });",
      "    this.emit({ type: 'notice', message: 'Dungeon abandonada.', level: 'warn' });",
      "  }",
    ]),
  },
  {
    label: 'spawnNextMonster dungeon path',
    old: J([
      "    if (!this.currentZoneId) return;",
      "    const zone = this.registry.getZone(this.currentZoneId);",
    ]),
    new: J([
      "    // DUNGEON: usa a queue da dungeon em vez da zona",
      "    if (this.dungeonsService.isActive()) {",
      "      const monsterId = this.dungeonsService.getCurrentMonsterId();",
      "      if (!monsterId) { this.abandonDungeon(); return; }",
      "      const mDef = this.registry.getMonster(monsterId as MonsterId);",
      "      if (!mDef) { this.abandonDungeon(); return; }",
      "      this.currentMonsterId = monsterId as MonsterId;",
      "      this.currentMonsterMaxHp = mDef.maxHp;",
      "      const p = this.buildPlayerInput();",
      "      const m = this.buildMonsterInput(mDef);",
      "      const base = newCombatState(nowMs, p, m);",
      "      const startHp = Math.max(1, Math.min(p.maxHp, this.character.hp));",
      "      const startRes = Math.max(0, Math.min(p.maxResource, this.character.resource));",
      "      this.combatState = { ...base, playerHp: startHp, playerResource: startRes };",
      "      this.syncCharacterFromCombat();",
      "      return;",
      "    }",
      "",
      "    if (!this.currentZoneId) return;",
      "    const zone = this.registry.getZone(this.currentZoneId);",
    ]),
  },
  {
    label: 'hook victory dungeon',
    old: "    this.triggerQuest({ kind: 'kill-monster', targetId: def.id as string, amount: 1 });",
    new: J([
      "    this.triggerQuest({ kind: 'kill-monster', targetId: def.id as string, amount: 1 });",
      "    if (this.dungeonsService.isActive()) {",
      "      const r = this.dungeonsService.recordKill(nowMs);",
      "      if (r.dungeonComplete && r.def) {",
      "        this.handleDungeonComplete(r.def, nowMs);",
      "      }",
      "      this.emit({ type: 'dungeon-changed' });",
      "    }",
    ]),
  },
  {
    label: 'hook defeat dungeon',
    old: "    this.emit({ type: 'notice', message: 'Foste derrotado. Recuperas em alguns segundos.', level: 'warn' });",
    new: J([
      "    if (this.dungeonsService.isActive()) {",
      "      this.dungeonsService.abandon();",
      "      this.emit({ type: 'dungeon-changed' });",
      "      this.emit({ type: 'notice', message: 'Foste derrotado. Dungeon falhada.', level: 'error' });",
      "    } else {",
      "      this.emit({ type: 'notice', message: 'Foste derrotado. Recuperas em alguns segundos.', level: 'warn' });",
      "    }",
    ]),
  },
  {
    label: 'metodo handleDungeonComplete',
    old: "  private handleDefeat(nowMs: number): void {",
    new: J([
      "  private handleDungeonComplete(def: DungeonDefinition, nowMs: number): void {",
      "    const r = this.dungeonsService.complete(nowMs);",
      "    if (!r) return;",
      "    const silver = def.completionSilver;",
      "    const xp = def.completionXp;",
      "    this.character = addSilver(this.character, silver);",
      "    const prevLevel = this.character.level;",
      "    this.character = applyExperience(this.character, xp).state;",
      "    if (this.character.level > prevLevel) {",
      "      const d = this.getDerivedStats();",
      "      this.character = { ...this.character, hp: d.maxHp, resource: d.maxResource };",
      "    }",
      "    const itemDeltas: { itemId: ItemId; delta: number }[] = [];",
      "    for (const l of def.completionLoot) {",
      "      if (this.rng() >= l.chance) continue;",
      "      const span = l.maxQuantity - l.minQuantity + 1;",
      "      const qty = l.minQuantity + Math.floor(this.rng() * span);",
      "      const itemId = asItemId(l.itemId);",
      "      const itemDef = this.registry.getItem(itemId);",
      "      if (!itemDef) continue;",
      "      this.inventory.add(itemId, qty, itemDef.maxStack, 0);",
      "      itemDeltas.push({ itemId, delta: qty });",
      "    }",
      "    if (r.isFirstClear && def.firstClearBonus) {",
      "      const fb = def.firstClearBonus;",
      "      this.character = addSilver(this.character, fb.silver);",
      "      this.character = applyExperience(this.character, fb.xp).state;",
      "      for (const it of fb.items) {",
      "        const itemId = asItemId(it.itemId);",
      "        const itemDef = this.registry.getItem(itemId);",
      "        if (!itemDef) continue;",
      "        const dur = isTool(itemDef) ? itemDef.maxDurability : null;",
      "        this.inventory.add(itemId, it.quantity, itemDef.maxStack, 0, dur);",
      "        itemDeltas.push({ itemId, delta: it.quantity });",
      "      }",
      "      this.emit({ type: 'notice', message: '1a conclusao! Bonus unico recebido.', level: 'info' });",
      "    }",
      "    this.ledger.record('combat', silver, itemDeltas, 'Dungeon: ' + def.name, nowMs);",
      "    const secs = Math.floor(r.elapsed / 1000);",
      "    const min = Math.floor(secs / 60);",
      "    const s = secs % 60;",
      "    const timeStr = min > 0 ? (min + 'm' + s + 's') : (s + 's');",
      "    this.emit({ type: 'notice', message: def.name + ' concluida em ' + timeStr + '!', level: 'info' });",
      "    this.emit({ type: 'character-changed' });",
      "    this.emit({ type: 'inventory-changed' });",
      "    this.emit({ type: 'dungeon-changed' });",
      "    this.stopCombat();",
      "  }",
      "  private handleDefeat(nowMs: number): void {",
    ]),
  },
  {
    label: 'tickCombat timeout',
    old: J([
      "    if (deltaMs <= 0) return;",
      "    const dt = Math.min(deltaMs, MAX_TICK_MS);",
    ]),
    new: J([
      "    if (deltaMs <= 0) return;",
      "    if (this.dungeonsService.isActive() && this.dungeonsService.checkTimeout(nowMs)) {",
      "      this.emit({ type: 'notice', message: 'Tempo esgotado! Dungeon falhada.', level: 'error' });",
      "      this.combatState = null;",
      "      this.currentMonsterId = null;",
      "      this.emit({ type: 'dungeon-changed' });",
      "      this.emit({ type: 'combat-changed' });",
      "      return;",
      "    }",
      "    const dt = Math.min(deltaMs, MAX_TICK_MS);",
    ]),
  },
  {
    label: 'toSnapshot dungeons',
    old: J([
      "      specialization: {",
      "        active: this.specializationsService.getActiveId(),",
      "        changeCount: this.specializationsService.getState().changeCount,",
      "        lastChangeAt: this.specializationsService.getState().lastChangeAt,",
      "      },",
    ]),
    new: J([
      "      specialization: {",
      "        active: this.specializationsService.getActiveId(),",
      "        changeCount: this.specializationsService.getState().changeCount,",
      "        lastChangeAt: this.specializationsService.getState().lastChangeAt,",
      "      },",
      "      dungeons: {",
      "        active: this.dungeonsService.getState().active ? { ...this.dungeonsService.getState().active } : null,",
      "        results: Object.fromEntries(Object.entries(this.dungeonsService.getState().results).map(([k, v]) => [k, { ...v }])),",
      "      },",
    ]),
  },
  {
    label: 'createInitial dungeons',
    old: J([
      "      specialization: { active: null, changeCount: 0, lastChangeAt: 0 },",
      "    }, rng);",
    ]),
    new: J([
      "      specialization: { active: null, changeCount: 0, lastChangeAt: 0 },",
      "      dungeons: { active: null, results: {} },",
      "    }, rng);",
    ]),
  },
  {
    label: 'schemaVersion 14 -> 15',
    old: "      schemaVersion: 14,",
    new: "      schemaVersion: 15,",
    all: true,
  },
];

let fail = false;
for (const s of steps) {
  const occurrences = s.all ? c.split(s.old).length - 1 : (c.includes(s.old) ? 1 : 0);
  if (occurrences === 0) {
    console.error('ERRO: anchor nao encontrado para: ' + s.label);
    console.error('Procurado:');
    console.error(s.old.substring(0, 300));
    fail = true;
    break;
  }
  if (s.all) {
    c = c.split(s.old).join(s.new);
  } else {
    c = c.replace(s.old, s.new);
  }
  console.log('OK: ' + s.label);
}

if (fail) process.exit(1);

const result = CRLF ? c.replace(/\n/g, '\r\n') : c;
fs.writeFileSync(PATH, result, 'utf8');
console.log('');
console.log('OK: game-services.ts patched com sucesso');