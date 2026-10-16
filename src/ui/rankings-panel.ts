import type { GameServices } from '../services/game-services';
import type { RankingEntry, SeasonInfo, MySeasonResult, PendingSeasonReward } from '../domain/rankings/types';
import { TIER_COLORS, TIER_LABELS } from '../domain/rankings/engine';
import { renderPanelHeader } from './panel-header';
import type { IconName } from './icons';

let cachedEntries: readonly RankingEntry[] = [];
let cachedMyHistory: readonly MySeasonResult[] = [];
let cachedSeason: SeasonInfo | null = null;
let loaded = false;
let lastFetch = 0;
const FETCH_THROTTLE_MS = 10_000;

export function renderRankingsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'rankings-content';

  root.appendChild(renderPanelHeader({
    icon: 'level-up',
    title: 'Rankings',
    subtitle: 'Classificacao da temporada actual',
  }));

  const pending = services.getRankingsState().pendingSeasonReward;
  if (pending) root.appendChild(buildPendingRewardBox(services, pending, root));

  const season = cachedSeason ?? services.getRankingsService().getSeason(Date.now());
  root.appendChild(buildSeasonStatus(season));

  if (!loaded) {
    const loading = document.createElement('div');
    loading.className = 'rankings-empty';
    loading.textContent = 'A carregar rankings...';
    root.appendChild(loading);
    void refresh(services, root);
    return root;
  }

  const podiumEntries = cachedEntries.slice(0, 3);
  if (podiumEntries.length > 0) {
    const podium = document.createElement('div');
    podium.className = 'rankings-podium';
    for (const e of podiumEntries) podium.appendChild(buildPodiumCard(e));
    root.appendChild(podium);
  }

  const listTitle = document.createElement('div');
  listTitle.className = 'rankings-section';
  listTitle.textContent = 'Classificacao completa';
  root.appendChild(listTitle);

  if (cachedEntries.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'rankings-empty';
    empty.textContent = 'Sem jogadores no ranking. Regista a tua build para entrares.';
    root.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'rankings-list';
    for (const e of cachedEntries) list.appendChild(buildRankRow(e));
    root.appendChild(list);
  }

  if (cachedMyHistory.length > 0) {
    const histTitle = document.createElement('div');
    histTitle.className = 'rankings-section';
    histTitle.textContent = 'Historico de temporadas';
    root.appendChild(histTitle);
    const histList = document.createElement('div');
    histList.className = 'rankings-history';
    for (const h of cachedMyHistory) histList.appendChild(buildHistoryRow(h));
    root.appendChild(histList);
  }

  return root;
}

async function refresh(services: GameServices, root: HTMLElement): Promise<void> {
  if (Date.now() - lastFetch < FETCH_THROTTLE_MS) return;
  lastFetch = Date.now();
  const svc = services.getRankingsService();
  const [entries, hist] = await Promise.all([svc.loadRankings(Date.now()), svc.loadMyHistory()]);
  cachedEntries = entries;
  cachedMyHistory = hist;
  cachedSeason = svc.getSeason(Date.now());
  loaded = true;
  const fresh = renderRankingsPanel(services);
  root.replaceWith(fresh);
}

function buildSeasonStatus(season: SeasonInfo): HTMLElement {
  const box = document.createElement('div');
  box.className = 'rankings-season';
  const name = document.createElement('div');
  name.className = 'rankings-season__name';
  name.textContent = season.name;
  box.appendChild(name);
  const info = document.createElement('div');
  info.className = 'rankings-season__info';
  const d = new Date(season.endsAt);
  info.textContent = 'Termina em ' + season.daysRemaining + ' dias (' + d.toLocaleDateString('pt-PT') + ')';
  box.appendChild(info);
  return box;
}

function buildPodiumCard(e: RankingEntry): HTMLElement {
  const card = document.createElement('div');
  card.className = 'rankings-podium__card rankings-podium__card--' + e.rank;
  const medal = document.createElement('div');
  medal.className = 'rankings-podium__medal';
  medal.textContent = String(e.rank);
  card.appendChild(medal);
  const name = document.createElement('div');
  name.className = 'rankings-podium__name';
  name.textContent = e.characterName;
  card.appendChild(name);
  const tier = document.createElement('div');
  tier.className = 'rankings-podium__tier';
  tier.style.color = TIER_COLORS[e.tier];
  tier.textContent = TIER_LABELS[e.tier];
  card.appendChild(tier);
  const rating = document.createElement('div');
  rating.className = 'rankings-podium__rating';
  rating.textContent = String(e.rating);
  card.appendChild(rating);
  return card;
}

function buildRankRow(e: RankingEntry): HTMLElement {
  const row = document.createElement('div');
  row.className = 'rankings-row' + (e.isCurrentUser ? ' rankings-row--me' : '');
  const rank = document.createElement('div');
  rank.className = 'rankings-row__rank';
  rank.textContent = '#' + e.rank;
  row.appendChild(rank);
  const name = document.createElement('div');
  name.className = 'rankings-row__name';
  name.textContent = e.characterName + (e.isCurrentUser ? ' (tu)' : '');
  row.appendChild(name);
  const tier = document.createElement('div');
  tier.className = 'rankings-row__tier';
  tier.style.color = TIER_COLORS[e.tier];
  tier.textContent = TIER_LABELS[e.tier];
  row.appendChild(tier);
  const wl = document.createElement('div');
  wl.className = 'rankings-row__wl';
  wl.textContent = e.wins + 'V / ' + e.losses + 'D';
  row.appendChild(wl);
  const rating = document.createElement('div');
  rating.className = 'rankings-row__rating';
  rating.textContent = String(e.rating);
  row.appendChild(rating);
  return row;
}

function buildHistoryRow(h: MySeasonResult): HTMLElement {
  const row = document.createElement('div');
  row.className = 'rankings-history__row';
  const name = document.createElement('div');
  name.className = 'rankings-history__name';
  name.textContent = h.seasonName;
  row.appendChild(name);
  const rank = document.createElement('div');
  rank.className = 'rankings-history__rank';
  rank.textContent = h.finalRank !== null ? '#' + h.finalRank : 'sem rank';
  row.appendChild(rank);
  const tier = document.createElement('div');
  tier.className = 'rankings-history__tier';
  tier.style.color = TIER_COLORS[h.finalTier];
  tier.textContent = TIER_LABELS[h.finalTier];
  row.appendChild(tier);
  const rating = document.createElement('div');
  rating.className = 'rankings-history__rating';
  rating.textContent = String(h.finalRating);
  row.appendChild(rating);
  const claimed = document.createElement('div');
  claimed.className = 'rankings-history__claimed';
  claimed.textContent = h.rewardClaimed ? 'Reclamada' : 'Pendente';
  row.appendChild(claimed);
  return row;
}

function buildPendingRewardBox(
  services: GameServices,
  p: PendingSeasonReward,
  root: HTMLElement,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'rankings-pending';
  box.style.setProperty('--tier-color', TIER_COLORS[p.finalTier]);

  const title = document.createElement('div');
  title.className = 'rankings-pending__title';
  title.textContent = 'RECOMPENSA DE TEMPORADA';
  box.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.className = 'rankings-pending__subtitle';
  subtitle.textContent = p.seasonName + ' - ' + p.label;
  box.appendChild(subtitle);

  const info = document.createElement('div');
  info.className = 'rankings-pending__info';
  info.appendChild(infoLine('Tier final', TIER_LABELS[p.finalTier]));
  info.appendChild(infoLine('Rating final', String(p.finalRating)));
  info.appendChild(infoLine('Posicao', p.finalRank !== null ? '#' + p.finalRank : 'sem rank'));
  info.appendChild(infoLine('Recompensa', '+' + p.silver + ' prata, +' + p.xp + ' XP'));
  box.appendChild(info);

  const actions = document.createElement('div');
  actions.className = 'rankings-pending__actions';

  const claim = document.createElement('button');
  claim.type = 'button';
  claim.className = 'rankings-pending__btn rankings-pending__btn--primary';
  claim.textContent = 'RECLAMAR';
  claim.addEventListener('click', () => {
    void (async (): Promise<void> => {
      claim.disabled = true;
      await services.claimPendingSeasonReward();
      loaded = false;
      lastFetch = 0;
      const fresh = renderRankingsPanel(services);
      root.replaceWith(fresh);
    })();
  });
  actions.appendChild(claim);

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'rankings-pending__btn';
  dismiss.textContent = 'IGNORAR';
  dismiss.addEventListener('click', () => {
    if (!window.confirm('Ignorar a recompensa? Nao a podes recuperar.')) return;
    services.dismissPendingReward();
    loaded = false;
    lastFetch = 0;
    const fresh = renderRankingsPanel(services);
    root.replaceWith(fresh);
  });
  actions.appendChild(dismiss);

  box.appendChild(actions);
  return box;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'rankings-pending__line';
  const l = document.createElement('span');
  l.className = 'rankings-pending__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'rankings-pending__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

void (null as unknown as IconName);