import type { ContentRegistry } from '../data/registry';
import type { GameServices } from '../services/game-services';
import { TABS, TabController, type TabId } from './tabs';
import { renderResourceBar, updateResourceBar } from './resource-bar';
import { renderBuffBar } from './buff-bar';
import { renderTutorialOverlay } from './tutorial-overlay';
import { renderActivityBanner, updateActivityBanner } from './activity-banner';
import { PANEL_RENDERERS } from './panels';
import type { SaveManager } from '../persistence/save-manager';
import { DEFAULT_SLOT } from '../persistence/save-manager';
import { renderPersistenceControls } from './persistence-controls';
import { toast } from './toast';
import { BALANCE } from '../data/balance.config';

export interface AppShellHosts {
  readonly tabsHost: HTMLElement;
  readonly panelHost: HTMLElement;
  readonly resourceHost: HTMLElement;
  readonly controlsHost: HTMLElement;
  readonly buffHost: HTMLElement;
  readonly tutorialHost: HTMLElement;
  readonly bannerHost: HTMLElement;
}

export interface AppShellOptions {
  readonly registry: ContentRegistry;
  readonly services: GameServices;
  readonly saveManager: SaveManager;
  readonly onReload: () => Promise<void>;
  readonly onTabChange?: (tab: TabId) => void;
  readonly onSnapshotSaved?: ((snapshot: ReturnType<GameServices['toSnapshot']>) => void | Promise<void>) | undefined;
}

/**
 * Chave estrutural: identifica mudancas que exigem RECONSTRUIR o DOM.
 * Nao inclui HP, XP, progresso Ã¢â‚¬â€ esses sao atualizados in-place.
 */
function computeStructuralKey(services: GameServices, activeTab: TabId): string {
  const c = services.getCharacter();
  const inv = services.getInventory();
  const wh = services.getWarehouse();

  const invKey = inv.list().map((s) => s ? s.itemId + ':' + s.quantity + ':' + s.enhancementLevel : '_').join(',');
  const whKey = wh.list().map((s) => s ? s.itemId + ':' + s.quantity + ':' + s.enhancementLevel : '_').join(',');

  const combat = services.getCombatSession();
  const combatKey = combat ? combat.monsterId + ':' + combat.outcome : 'none';

  const act = services.getActivity();
  const actKey = act ? act.kind + ':' + act.targetId + ':' + act.batches : 'none';

  const buffs = services.getActiveBuffs();
  const buffsKey = buffs.map((b) => b.buffId).sort().join(',');

  const tut = services.getCurrentTutorialStep();
  const tutKey = tut ? tut.id + ':' + (services.getTutorialState().entries.find((e) => e.stepId === tut.id)?.currentCount ?? 0) : 'done';

  const quests = services.getAllQuests();
  const questKey = quests.map((q) => q.state.questId + ':' + q.state.status + ':' + (q.state.rewardClaimed ? 'R' : '') + ':' + q.state.progress.map((p) => p.currentCount).join('.')).join(',');

  const eq = services.getEquipment();
  const eqKey = Array.from(eq.list().entries()).map(([k, v]) => k + '=' + v.itemId + ':' + v.enhancementLevel).join(',');

  const idle = services.getIdleSetup();
  const idleKey = idle ? idle.activity.kind + ':' + JSON.stringify(idle.activity) : 'none';

  const report = services.getLastIdleReport();
  const reportKey = report ? report.endedAt.toString() : 'none';

  const farm = services.getFarm();
  const farmKey = farm.map((p) => p.id + ':' + (p.cropNodeId ?? '_') + ':' + (p.ready ? 'R' : 'G')).join(',');

  return [
    activeTab,
    'lvl:' + c.level,
    'silver:' + c.silver,
    'inv:' + invKey,
    'wh:' + whKey,
    'combat:' + combatKey,
    'act:' + actKey,
    'buffs:' + buffsKey,
    'tut:' + tutKey,
    'quests:' + questKey,
    'eq:' + eqKey,
    'idle:' + idleKey,
    'report:' + reportKey,
    'farm:' + farmKey,
  ].join('|');
}

export function mountAppShell(hosts: AppShellHosts, options: AppShellOptions): void {
  const { registry, services, saveManager, onReload, onTabChange, onSnapshotSaved } = options;

  hosts.controlsHost.replaceChildren(renderPersistenceControls({ services, saveManager, onReload }));

  const controller = new TabController();
  const tabButtons = new Map<TabId, HTMLButtonElement>();

  hosts.tabsHost.replaceChildren();
  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab-button';
    btn.textContent = tab.label;
    btn.addEventListener('click', () => controller.activate(tab.id));
    hosts.tabsHost.appendChild(btn);
    tabButtons.set(tab.id, btn);
  }

  let lastStructuralKey = '';

  const renderCurrent = (force: boolean): void => {
    const active = controller.current();
    const newKey = computeStructuralKey(services, active);
    if (!force && newKey === lastStructuralKey) return;
    lastStructuralKey = newKey;

    for (const [id, btn] of tabButtons) btn.classList.toggle('tab-button--active', id === active);
    hosts.resourceHost.replaceChildren(renderResourceBar(services));
    hosts.buffHost.replaceChildren(renderBuffBar(services));
    hosts.tutorialHost.replaceChildren(renderTutorialOverlay(services));
    hosts.bannerHost.replaceChildren(renderActivityBanner(services));
    const renderer = PANEL_RENDERERS[active];
    hosts.panelHost.replaceChildren(renderer(services, registry));
  };

  /** Atualiza valores dinÃƒÂ¢micos sem tocar no DOM estrutural. */
  const updateLive = (): void => {
    updateResourceBar(services);
    updateActivityBanner(services);
    updateBuffTimers(services);
  };

  controller.onChange((tab) => {
    renderCurrent(true);
    if (onTabChange) onTabChange(tab);
  });

  services.subscribe((event) => {
    if (event.type === 'notice') { toast(event.message, event.level); return; }
    // Qualquer mudanca estrutural -> rebuild no proximo ciclo
    lastStructuralKey = '';
  });

  /* ============ AUTO-SAVE ============ */
  let saving = false;
  const doAutoSave = async (): Promise<void> => {
    if (saving) return;
    saving = true;
    try {
      const snap = services.toSnapshot(Date.now());
      await saveManager.save(snap, DEFAULT_SLOT);
      if (onSnapshotSaved) { try { await onSnapshotSaved(snap); } catch (e) { console.error('[Zerk Cloud] sync falhou:', e); } }
    } catch (e) {
      console.error('[Zerk] Falha no auto-save:', e);
    } finally {
      saving = false;
    }
  };

  window.setInterval(() => { void doAutoSave(); }, BALANCE.persistence.autoSaveIntervalMs);

  window.addEventListener('beforeunload', () => {
    try {
      const snap = services.toSnapshot(Date.now());
      void saveManager.save(snap, DEFAULT_SLOT);
    } catch { /* ignore */ }
  });

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void doAutoSave();
  });

  /* ============ Loop principal ============ */
  let lastTick = performance.now();
  let lastLiveUpdate = 0;
  const SIM_INTERVAL_MS = 100;
  const LIVE_INTERVAL_MS = 250;

  const loop = (): void => {
    const now = performance.now();
    const delta = now - lastTick;
    lastTick = now;
    const realNow = Date.now();
    services.tickCombat(realNow, delta);
    services.tickLifeskill(realNow);

    // Live update (barras, HP, XP) a cada 250ms Ã¢â‚¬â€ sem tocar no DOM estrutural
    if (now - lastLiveUpdate >= LIVE_INTERVAL_MS) {
      lastLiveUpdate = now;
      updateLive();
      // Verificar se a chave estrutural mudou
      renderCurrent(false);
    }

    window.setTimeout(loop, SIM_INTERVAL_MS);
  };

  loop();
  renderCurrent(true);
}

/** Atualiza apenas os chips de tempo dos buffs. */
function updateBuffTimers(services: GameServices): void {
  const now = Date.now();
  const buffs = services.getActiveBuffs();
  for (const b of buffs) {
    const remaining = Math.max(0, b.expiresAt - now);
    const el = document.querySelector('[data-buff-time="' + (b.buffId as string) + '"]');
    if (el) el.textContent = formatDuration(remaining);
  }
}

function formatDuration(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return min + 'm' + sec.toString().padStart(2, '0') + 's';
  return sec + 's';
}