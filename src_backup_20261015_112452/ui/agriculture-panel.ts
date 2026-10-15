import type { GameServices } from '../services/game-services';
import { asItemId } from '../domain/ids';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { createButton } from './button';
import { createIcon } from './icons';

export function renderAgriculturePanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'seed',
    title: 'Agricultura',
    subtitle: 'Planta, espera e colhe',
  }));

  root.appendChild(renderSectionTitle('Parcelas'));

  const farm = services.getFarm();
  const grid = document.createElement('div');
  grid.className = 'farm-grid';

  for (const plot of farm) {
    const card = document.createElement('div');
    card.className = 'farm-plot';

    const title = document.createElement('div');
    title.className = 'farm-plot__title';
    title.textContent = 'Parcela ' + (plot.id + 1);
    card.appendChild(title);

    if (plot.cropNodeId === null) {
      card.classList.add('farm-plot--empty');
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Vazia';
      card.appendChild(empty);
    } else {
      const crop = document.createElement('p');
      crop.className = 'farm-plot__crop';
      crop.textContent = plot.cropName ?? plot.cropNodeId;
      card.appendChild(crop);

      const track = document.createElement('div');
      track.className = 'bar__track';
      const fill = document.createElement('div');
      fill.className = 'bar__fill';
      fill.style.width = (plot.progress * 100).toFixed(1) + '%';
      track.appendChild(fill);
      card.appendChild(track);

      if (plot.ready) {
        card.appendChild(createButton({
          label: 'Colher',
          icon: 'wheat',
          variant: 'primary',
          onClick: () => services.harvestPlot(plot.id),
        }));
      } else {
        const remaining = Math.max(0, plot.readyAt - Date.now());
        const timer = document.createElement('p');
        timer.className = 'muted';
        timer.textContent = 'Pronto em ' + Math.ceil(remaining / 1000) + 's';
        card.appendChild(timer);
      }
    }
    grid.appendChild(card);
  }
  root.appendChild(grid);

  root.appendChild(renderSectionTitle('Sementes no inventario'));

  const inv = services.getInventory();
  const slots = inv.list();
  const seedList = document.createElement('div');
  seedList.className = 'seed-list';
  let hasSeeds = false;

  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const def = services.registry.getItem(s.itemId);
    if (!def || def.seedForNodeId === null) continue;
    hasSeeds = true;

    const card = document.createElement('div');
    card.className = 'seed-card';

    const left = document.createElement('div');
    left.className = 'seed-card__left';
    const name = document.createElement('span');
    name.className = 'seed-card__name';
    name.textContent = def.name + ' x' + s.quantity;
    left.appendChild(name);
    card.appendChild(left);

    card.appendChild(createButton({
      label: 'Plantar',
      icon: 'seed',
      onClick: () => {
        const freePlot = services.getFarm().find((p) => p.cropNodeId === null);
        if (!freePlot) { services.plantSeed(i, -1); return; }
        services.plantSeed(i, freePlot.id);
      },
    }));

    seedList.appendChild(card);
  }

  if (!hasSeeds) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Nenhuma semente no inventario. Compra abaixo.';
    seedList.appendChild(empty);
  }
  root.appendChild(seedList);

  root.appendChild(renderSectionTitle('Comprar sementes'));

  const shopList = document.createElement('div');
  shopList.className = 'seed-list';
  const char = services.getCharacter();

  for (const entry of services.getSeedShop()) {
    const card = document.createElement('div');
    card.className = 'seed-card seed-card--shop';

    const left = document.createElement('div');
    left.className = 'seed-card__left';
    const name = document.createElement('div');
    name.className = 'seed-card__name';
    name.textContent = entry.name;
    left.appendChild(name);
    const price = document.createElement('div');
    price.className = 'muted';
    price.textContent = entry.price + ' prata cada (tens ' + char.silver + ')';
    left.appendChild(price);
    card.appendChild(left);

    const buttons = document.createElement('div');
    buttons.className = 'seed-card__buttons';

    buttons.appendChild(createButton({
      label: 'x1',
      icon: 'coin',
      disabled: char.silver < entry.price,
      onClick: () => services.buySeed(asItemId(entry.itemId as string), 1),
    }));
    buttons.appendChild(createButton({
      label: 'x5',
      icon: 'coin',
      disabled: char.silver < entry.price * 5,
      onClick: () => services.buySeed(asItemId(entry.itemId as string), 5),
    }));

    card.appendChild(buttons);
    shopList.appendChild(card);
  }
  root.appendChild(shopList);

  void createIcon;
  return root;
}