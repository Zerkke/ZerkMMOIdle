import { TypedEventBus } from './core/event-bus';
import type { AppEventMap } from './core/app-events';
import { createDemoRegistry } from './data/registry';
import { SaveManager, DEFAULT_SLOT } from './persistence/save-manager';
import { IndexedDbPersistence } from './persistence/indexeddb-adapter';
import { GameServices } from './services/game-services';
import { mountAppShell } from './ui/app-shell';
import { toast } from './ui/toast';
import { requireAuth } from './auth/boot';
import { loadCloudSave, saveCloudSave } from './auth/cloud-save';
import './style.css';

function requireElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error('Elemento obrigatorio nao encontrado: #' + id);
  return el;
}

async function bootstrap(): Promise<void> {
  const auth = await requireAuth();
  if (!auth.ok) return;

  const registry = createDemoRegistry();
  const persistence = new IndexedDbPersistence();
  const saveManager = new SaveManager(persistence);

  // Carrega local + cloud, escolhe o mais recente
  let localSave = null;
  try { localSave = await saveManager.load(DEFAULT_SLOT); } catch (e) { console.error(e); }

  let cloudSave: typeof localSave = null;
  if (auth.userId) {
    cloudSave = await loadCloudSave(auth.userId);
  }

  let chosenSave = localSave;
  let usedCloud = false;
  if (cloudSave && (!localSave || (cloudSave.savedAt ?? 0) > (localSave.savedAt ?? 0))) {
    chosenSave = cloudSave;
    usedCloud = true;
  }

  let services: GameServices;
  let lastSaveAt = 0;
  try {
    if (chosenSave) {
      lastSaveAt = chosenSave.savedAt ?? 0;
      services = new GameServices(registry, chosenSave);
      if (usedCloud) {
        toast('Save da cloud carregado.', 'info');
        try { await saveManager.save(chosenSave, DEFAULT_SLOT); } catch (e) { console.error(e); }
      } else if (cloudSave && auth.userId) {
        try { await saveCloudSave(auth.userId, chosenSave); } catch (e) { console.error(e); }
      } else if (auth.userId) {
        try { await saveCloudSave(auth.userId, chosenSave); } catch (e) { console.error(e); }
        toast('Save local sincronizado para a cloud.', 'info');
      } else {
        toast('Save local carregado.', 'info');
      }
    } else {
      services = GameServices.createInitial(registry);
      const snap = services.toSnapshot(Date.now());
      await saveManager.save(snap, DEFAULT_SLOT);
      if (auth.userId) { try { await saveCloudSave(auth.userId, snap); } catch (e) { console.error(e); } }
      toast('Novo jogo criado.', 'info');
    }
  } catch (error) {
    console.error('[Zerk] Falha ao carregar save.', error);
    toast('Save corrompido. A iniciar novo jogo.', 'warn');
    services = GameServices.createInitial(registry);
    try { await saveManager.save(services.toSnapshot(Date.now()), DEFAULT_SLOT); } catch (e) { console.error(e); }
  }

  if (lastSaveAt > 0) {
    const report = services.runIdleCatchup(lastSaveAt, Date.now());
    if (report) {
      const dur = Math.floor(report.simulatedMs / 60000);
      toast('Simulaste ' + dur + ' min offline. Ve o separador Idle.', 'info');
    }
  }

  const eventBus = new TypedEventBus<AppEventMap>();
  eventBus.emit('content:loaded', {
    items: registry.items.size, classes: registry.classes.size,
    monsters: registry.monsters.size, zones: registry.zones.size,
  });

  const hosts = {
    tabsHost: requireElement('tab-nav'),
    panelHost: requireElement('side-panel-content'),
    resourceHost: requireElement('resource-bar-host'),
    controlsHost: requireElement('save-controls-host'),
    buffHost: requireElement('buff-bar-host'),
    tutorialHost: requireElement('tutorial-overlay-host'),
    bannerHost: requireElement('activity-banner-host'),
  };

  const userId = auth.userId;
  mountAppShell(hosts, {
    registry, services, saveManager,
    onReload: async () => { window.location.reload(); },
    onTabChange: (tab) => eventBus.emit('ui:tab-changed', { tab }),
    onSnapshotSaved: userId ? async (snap) => { await saveCloudSave(userId, snap); } : undefined,
  });

  eventBus.emit('game:ready', { timestamp: Date.now() });
  console.log('[Zerk] Auth OK. UserId: ' + (userId ?? 'anon'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { void bootstrap(); });
} else {
  void bootstrap();
}