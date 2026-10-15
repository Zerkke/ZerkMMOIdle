import type { GameServices } from '../services/game-services';
import type { SaveManager } from '../persistence/save-manager';
import { DEFAULT_SLOT } from '../persistence/save-manager';
import { loadFromJson, saveToJson } from '../persistence/json-io';
import { toast } from './toast';

export interface PersistenceControlsOptions {
  readonly services: GameServices;
  readonly saveManager: SaveManager;
  readonly onReload: () => Promise<void>;
}

export function renderPersistenceControls(opts: PersistenceControlsOptions): HTMLElement {
  const root = document.createElement('div');
  root.className = 'persistence-controls';

  const saveBtn = button('Guardar', async () => {
    try {
      await opts.saveManager.save(opts.services.toSnapshot(Date.now()), DEFAULT_SLOT);
      toast('Jogo guardado.', 'info');
    } catch (error) {
      toast(`Erro ao guardar: ${describe(error)}`, 'error');
    }
  });

  const loadBtn = button('Carregar', async () => {
    if (!confirm('Carregar o save substitui o estado atual. Continuar?')) return;
    try {
      const save = await opts.saveManager.load(DEFAULT_SLOT);
      if (!save) {
        toast('Nenhum save encontrado.', 'warn');
        return;
      }
      await opts.saveManager.save(save, DEFAULT_SLOT);
      await opts.onReload();
      toast('Save carregado.', 'info');
    } catch (error) {
      toast(`Save invalido: ${describe(error)}`, 'error');
    }
  });

  const exportBtn = button('Exportar JSON', () => {
    const save = opts.services.toSnapshot(Date.now());
    const json = saveToJson(save);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zerk-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const importBtn = button('Importar JSON', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!confirm('Substituir o save atual pelo ficheiro importado?')) return;
      try {
        const text = await file.text();
        const save = loadFromJson(text);
        await opts.saveManager.save(save, DEFAULT_SLOT);
        await opts.onReload();
        toast('Save importado com sucesso.', 'info');
      } catch (error) {
        toast(`Importacao falhou: ${describe(error)}`, 'error');
      }
    });
    input.click();
  });

  const deleteBtn = button('Apagar save', async () => {
    if (!confirm('Apagar o save guardado? Esta acao nao pode ser desfeita.')) return;
    try {
      await opts.saveManager.remove(DEFAULT_SLOT);
      toast('Save apagado.', 'warn');
    } catch (error) {
      toast(`Erro: ${describe(error)}`, 'error');
    }
  });

  root.appendChild(saveBtn);
  root.appendChild(loadBtn);
  root.appendChild(exportBtn);
  root.appendChild(importBtn);
  root.appendChild(deleteBtn);
  return root;
}

function button(label: string, onClick: () => void | Promise<void>): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'action-button';
  b.textContent = label;
  b.addEventListener('click', () => { void onClick(); });
  return b;
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}