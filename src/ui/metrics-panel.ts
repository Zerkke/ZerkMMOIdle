import type { GameServices } from '../services/game-services';

export function renderMetricsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  const header = document.createElement('h2');
  header.textContent = 'Economia';
  root.appendChild(header);

  const m = services.getMetrics();
  const char = services.getCharacter();

  const sum = document.createElement('div');
  sum.className = 'info-grid';
  sum.appendChild(row('Prata atual', String(char.silver)));
  sum.appendChild(row('Rendimento total', String(m.totalIncome)));
  sum.appendChild(row('Despesa total', String(m.totalExpense)));
  sum.appendChild(row('Saldo liquido', String(m.netSilver)));
  root.appendChild(sum);

  const catTitle = document.createElement('h3');
  catTitle.textContent = 'Por categoria';
  root.appendChild(catTitle);

  const cat = document.createElement('div');
  cat.className = 'info-grid';
  for (const [k, v] of Object.entries(m.byCategory)) {
    if (v.income === 0 && v.expense === 0) continue;
    cat.appendChild(row(k, '+' + v.income + ' / -' + v.expense));
  }
  if (cat.children.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Sem transacoes registadas.';
    cat.appendChild(empty);
  }
  root.appendChild(cat);

  const logTitle = document.createElement('h3');
  logTitle.textContent = 'Ultimas transacoes';
  root.appendChild(logTitle);

  const log = document.createElement('div');
  log.className = 'transaction-log';
  const recent = services.getRecentTransactions(20);
  if (recent.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Sem historico.';
    log.appendChild(empty);
  } else {
    for (const t of recent) {
      const e = document.createElement('div');
      e.className = 'transaction-log__entry transaction-log__entry--' + (t.silverDelta >= 0 ? 'positive' : 'negative');
      const sign = t.silverDelta >= 0 ? '+' : '';
      e.textContent = '[' + t.category + '] ' + t.label + ' (' + sign + t.silverDelta + ')';
      log.appendChild(e);
    }
  }
  root.appendChild(log);

  return root;
}

function row(label: string, value: string): HTMLElement {
  const r = document.createElement('div');
  r.className = 'info-row';
  const l = document.createElement('span');
  l.className = 'info-row__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'info-row__value';
  v.textContent = value;
  r.appendChild(l);
  r.appendChild(v);
  return r;
}