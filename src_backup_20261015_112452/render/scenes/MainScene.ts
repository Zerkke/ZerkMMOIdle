import Phaser from 'phaser';
import type { GameServices, CombatSessionInfo, LifeskillSessionInfo } from '../../services/game-services';
import { GAME_CONFIG } from '../../config/game-config';

const MONSTER_COLORS: readonly number[] = [
  0x5a9a6a, 0xaa6a4a, 0xba4a5a, 0x6a6a9a, 0x8a4a9a, 0xaa8a3a,
];

const GROUND_Y_RATIO = 0.72;
const PLAYER_X_RATIO = 0.30;
const MONSTER_X_RATIO = 0.70;
const PLAYER_HP_BAR_WIDTH = 260;
const PLAYER_HP_BAR_HEIGHT = 22;
const MONSTER_HP_BAR_WIDTH = 180;
const MONSTER_HP_BAR_HEIGHT = 14;
const ACTIVITY_BAR_WIDTH = 160;
const ACTIVITY_BAR_HEIGHT = 12;

export class MainScene extends Phaser.Scene {
  private services: GameServices | null = null;
  private lastLogLength = 0;
  private lastKills = 0;
  private lastActivityKey = '';
  private lastPlayerHp = -1;
  private lastPlayerHpMax = -1;
  private lastMonsterHp = -1;
  private lastMonsterHpMax = -1;
  private lastActivityProgress = -1;

  private bgGraphics!: Phaser.GameObjects.Graphics;
  private groundGraphics!: Phaser.GameObjects.Graphics;
  private zoneLabel!: Phaser.GameObjects.Text;
  private playerContainer!: Phaser.GameObjects.Container;
  private playerHpBarFill!: Phaser.GameObjects.Rectangle;
  private playerHpText!: Phaser.GameObjects.Text;

  private monsterContainer: Phaser.GameObjects.Container | null = null;
  private monsterHpBarContainer: Phaser.GameObjects.Container | null = null;
  private monsterHpBarFill: Phaser.GameObjects.Rectangle | null = null;
  private monsterHpText: Phaser.GameObjects.Text | null = null;
  private monsterNameLabel: Phaser.GameObjects.Container | null = null;

  private nodeContainer: Phaser.GameObjects.Container | null = null;
  private activityBarContainer: Phaser.GameObjects.Container | null = null;
  private activityBarFill: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  attachServices(services: GameServices): void {
    this.services = services;
    this.refreshLayout();
  }

  create(): void {
    const { width, height, colors } = GAME_CONFIG;
    this.cameras.main.setBackgroundColor(colors.background);

    this.bgGraphics = this.add.graphics().setDepth(0);
    this.drawBackground(width, height);

    this.groundGraphics = this.add.graphics().setDepth(5);
    this.drawGround(width, height);

    this.zoneLabel = this.add.text(width / 2, 32, 'A explorar o mundo...', {
      fontFamily: 'Georgia, serif',
      fontSize: '17px',
      color: '#c8b8e0',
      stroke: '#0d0a1a',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);

    this.buildPlayerHpBar();

    this.playerContainer = this.buildPlayerContainer(width * PLAYER_X_RATIO, height * GROUND_Y_RATIO);
    this.playerContainer.setDepth(10);

    this.tweens.add({
      targets: this.playerContainer,
      y: this.playerContainer.y - 3,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.game.events.emit('game:scene-ready', { scene: 'MainScene' });
  }

  override update(): void {
    if (!this.services) return;
    this.tickCombatAnimation();
    this.tickActivityAnimation();
    this.refreshPlayerHpBarIfChanged();
  }

  /* ============== BACKGROUND ============== */

  private drawBackground(width: number, height: number): void {
    this.bgGraphics.clear();
    this.bgGraphics.fillGradientStyle(0x2a1a4a, 0x2a1a4a, 0x0d0518, 0x0d0518, 1);
    this.bgGraphics.fillRect(0, 0, width, height);
  }

  private drawGround(width: number, height: number): void {
    const groundY = height * GROUND_Y_RATIO;
    this.groundGraphics.clear();
    this.groundGraphics.fillStyle(0x080410, 1);
    this.groundGraphics.fillRect(0, groundY, width, height - groundY);
    this.groundGraphics.lineStyle(2, 0x4a3a6a, 1);
    this.groundGraphics.lineBetween(0, groundY, width, groundY);
    this.groundGraphics.lineStyle(1, 0x1a0a2a, 0.7);
    this.groundGraphics.lineBetween(0, groundY + 30, width, groundY + 30);
    this.groundGraphics.lineBetween(0, groundY + 80, width, groundY + 80);
  }

  /* ============== PLAYER ============== */

  private buildPlayerContainer(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);

    c.add(this.add.ellipse(0, 0, 76, 16, 0x000000, 0.4));

    const lLeg = this.add.rectangle(-10, -20, 12, 38, 0x3a3a5a);
    lLeg.setOrigin(0.5, 1); lLeg.setStrokeStyle(1, 0x1a1a3a);
    c.add(lLeg);

    const rLeg = this.add.rectangle(10, -20, 12, 38, 0x3a3a5a);
    rLeg.setOrigin(0.5, 1); rLeg.setStrokeStyle(1, 0x1a1a3a);
    c.add(rLeg);

    const lBoot = this.add.rectangle(-10, 0, 20, 12, 0x2a1a1a);
    lBoot.setOrigin(0.5, 1);
    c.add(lBoot);

    const rBoot = this.add.rectangle(10, 0, 20, 12, 0x2a1a1a);
    rBoot.setOrigin(0.5, 1);
    c.add(rBoot);

    const body = this.add.rectangle(0, -62, 48, 46, 0x5a8ac8);
    body.setStrokeStyle(2, 0x2a4a7a);
    c.add(body);

    c.add(this.add.rectangle(0, -72, 30, 6, 0x7aa8e0));
    c.add(this.add.rectangle(0, -44, 50, 6, 0x8a6a2a));
    c.add(this.add.rectangle(0, -44, 8, 8, 0xd4a24e));

    const head = this.add.circle(0, -96, 20, 0xd4a88a);
    head.setStrokeStyle(2, 0x8a6858);
    c.add(head);

    c.add(this.add.ellipse(0, -112, 36, 14, 0x4a2a1a));

    c.add(this.add.circle(-7, -98, 3, 0xffffff));
    c.add(this.add.circle(7, -98, 3, 0xffffff));
    c.add(this.add.circle(-7, -98, 1.5, 0x1a0a0a));
    c.add(this.add.circle(7, -98, 1.5, 0x1a0a0a));

    c.add(this.add.rectangle(0, -88, 8, 2, 0x6a4a3a));

    const blade = this.add.rectangle(32, -76, 6, 60, 0xd0d0e0);
    blade.setStrokeStyle(1, 0x808090);
    c.add(blade);
    c.add(this.add.rectangle(30, -76, 1, 58, 0xffffff, 0.6));

    const hilt = this.add.rectangle(32, -42, 16, 5, 0x8a6a2a);
    hilt.setStrokeStyle(1, 0x5a3a1a);
    c.add(hilt);

    const pommel = this.add.circle(32, -36, 3.5, 0xd4a24e);
    pommel.setStrokeStyle(1, 0x8a6a2a);
    c.add(pommel);

    return c;
  }

  private buildPlayerHpBar(): void {
    const barW = PLAYER_HP_BAR_WIDTH;
    const barH = PLAYER_HP_BAR_HEIGHT;
    const x = 20;
    const y = 20;

    this.add.rectangle(x - 2, y - 2, barW + 4, barH + 4, 0x1a0f2a).setOrigin(0, 0).setDepth(50);
    this.add.rectangle(x, y, barW, barH, 0x1a1428).setOrigin(0, 0).setDepth(50);
    this.playerHpBarFill = this.add.rectangle(x, y, barW, barH, 0x6ab87a).setOrigin(0, 0).setDepth(51);

    this.add.text(x + 8, y + barH / 2, 'HP', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#1a0a0a', fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(52);

    this.playerHpText = this.add.text(x + barW - 8, y + barH / 2, '0 / 0', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(52);
  }

  private refreshPlayerHpBarIfChanged(): void {
    if (!this.services) return;
    const hp = this.services.getCurrentPlayerHp();
    const maxHp = this.services.getDerivedStats().maxHp;
    if (hp === this.lastPlayerHp && maxHp === this.lastPlayerHpMax) return;
    this.lastPlayerHp = hp;
    this.lastPlayerHpMax = maxHp;
    const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    this.playerHpBarFill.width = PLAYER_HP_BAR_WIDTH * pct;
    this.playerHpText.setText(hp + ' / ' + maxHp);
  }

  /* ============== LAYOUT ============== */

  refreshLayout(): void {
    if (!this.services) return;
    this.refreshMonsterOrNode();
    this.refreshBackground();
  }

  private refreshBackground(): void {
    if (!this.services) return;
    const { width, height } = GAME_CONFIG;
    const combat = this.services.getCombatSession();
    const activity = this.services.getActivity();

    let top = 0x2a1a4a;
    let bottom = 0x0d0518;
    if (combat) { top = 0x3a1020; bottom = 0x0d0510; }
    else if (activity) {
      if (activity.kind === 'gathering') { top = 0x102a1a; bottom = 0x050d08; }
      else { top = 0x1a1a3a; bottom = 0x050510; }
    }

    this.bgGraphics.clear();
    this.bgGraphics.fillGradientStyle(top, top, bottom, bottom, 1);
    this.bgGraphics.fillRect(0, 0, width, height);
  }

  private refreshMonsterOrNode(): void {
    if (!this.services) return;
    const { width, height } = GAME_CONFIG;
    const combat = this.services.getCombatSession();

    if (combat) {
      this.destroyNode();
      const key = 'combat:' + combat.monsterId;
      if (this.lastActivityKey !== key) {
        this.lastActivityKey = key;
        this.destroyMonster();
        this.buildMonster(combat, width * MONSTER_X_RATIO, height * GROUND_Y_RATIO);
        this.zoneLabel.setText('A combater: ' + combat.monsterName);
      }
      return;
    }

    const activity = this.services.getActivity();
    if (activity) {
      this.destroyMonster();
      const key = activity.kind + ':' + activity.targetId;
      if (this.lastActivityKey !== key) {
        this.lastActivityKey = key;
        this.destroyNode();
        this.buildNode(activity, width * 0.72, height * GROUND_Y_RATIO);
        this.zoneLabel.setText(activity.kind === 'gathering' ? 'A recolher: ' + activity.targetName : 'A produzir: ' + activity.targetName);
      }
      return;
    }

    if (this.lastActivityKey !== 'idle') {
      this.lastActivityKey = 'idle';
      this.destroyMonster();
      this.destroyNode();
      this.zoneLabel.setText('A explorar o mundo...');
    }
  }

  /* ============== MONSTER ============== */

  private buildMonster(combat: CombatSessionInfo, x: number, y: number): void {
    const hash = Array.from(combat.monsterId as string).reduce((a, c) => a + c.charCodeAt(0), 0);
    const color = MONSTER_COLORS[hash % MONSTER_COLORS.length] ?? 0x5a9a6a;

    const c = this.add.container(x, y).setDepth(8);
    c.add(this.add.ellipse(0, 0, 140, 24, 0x000000, 0.45));

    const body = this.add.circle(0, -58, 58, color);
    body.setStrokeStyle(4, 0x000000, 0.4);
    c.add(body);

    c.add(this.add.circle(-18, -80, 26, 0xffffff, 0.18));

    const eyeL = this.add.circle(-16, -68, 9, 0xffffff).setStrokeStyle(2, 0x000000, 0.5);
    const eyeR = this.add.circle(16, -68, 9, 0xffffff).setStrokeStyle(2, 0x000000, 0.5);
    c.add([eyeL, eyeR]);
    c.add(this.add.circle(-16, -66, 4, 0x1a0a0a));
    c.add(this.add.circle(16, -66, 4, 0x1a0a0a));

    const browL = this.add.rectangle(-16, -82, 16, 4, 0x1a0a1a);
    browL.setRotation(0.35);
    c.add(browL);
    const browR = this.add.rectangle(16, -82, 16, 4, 0x1a0a1a);
    browR.setRotation(-0.35);
    c.add(browR);

    c.add(this.add.ellipse(0, -38, 26, 10, 0x1a0a1a));
    c.add(this.add.triangle(-8, -38, 0, 0, 4, 0, 2, 6, 0xffffff));
    c.add(this.add.triangle(8, -38, 0, 0, 4, 0, 2, 6, 0xffffff));

    this.monsterContainer = c;

    const nameY = y - 145;
    const nameBg = this.add.rectangle(x, nameY, 200, 26, 0x1a0f2a, 0.8);
    nameBg.setStrokeStyle(1, 0x4a3a6a);
    const nameText = this.add.text(x, nameY, combat.monsterName, {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#e8e0f0', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.monsterNameLabel = this.add.container(0, 0, [nameBg, nameText]).setDepth(99);

    const barY = y + 20;
    const container = this.add.container(x, barY).setDepth(99);

    const border = this.add.rectangle(0, 0, MONSTER_HP_BAR_WIDTH + 4, MONSTER_HP_BAR_HEIGHT + 4, 0x1a0f2a);
    const bg = this.add.rectangle(0, 0, MONSTER_HP_BAR_WIDTH, MONSTER_HP_BAR_HEIGHT, 0x1a1428);
    const fill = this.add.rectangle(-MONSTER_HP_BAR_WIDTH / 2, 0, MONSTER_HP_BAR_WIDTH, MONSTER_HP_BAR_HEIGHT, 0xc94a5a).setOrigin(0, 0.5);
    const text = this.add.text(0, 0, '', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([border, bg, fill, text]);
    this.monsterHpBarContainer = container;
    this.monsterHpBarFill = fill;
    this.monsterHpText = text;

    this.lastMonsterHp = -1;
    this.lastMonsterHpMax = -1;
    this.updateMonsterHpBar(combat.monsterHp, combat.monsterMaxHp);
  }

  private destroyMonster(): void {
    if (this.monsterContainer) { this.monsterContainer.destroy(); this.monsterContainer = null; }
    if (this.monsterHpBarContainer) { this.monsterHpBarContainer.destroy(); this.monsterHpBarContainer = null; }
    this.monsterHpBarFill = null;
    this.monsterHpText = null;
    if (this.monsterNameLabel) { this.monsterNameLabel.destroy(); this.monsterNameLabel = null; }
    this.lastMonsterHp = -1;
    this.lastMonsterHpMax = -1;
  }

  private updateMonsterHpBar(current: number, max: number): void {
    if (!this.monsterHpBarFill) return;
    if (current === this.lastMonsterHp && max === this.lastMonsterHpMax) return;
    this.lastMonsterHp = current;
    this.lastMonsterHpMax = max;
    const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    this.monsterHpBarFill.width = MONSTER_HP_BAR_WIDTH * pct;
    if (this.monsterHpText) this.monsterHpText.setText(current + ' / ' + max);
  }

  /* ============== NODE ============== */

  private buildNode(activity: LifeskillSessionInfo, x: number, y: number): void {
    const c = this.add.container(x, y).setDepth(8);
    c.add(this.add.ellipse(0, 0, 110, 20, 0x000000, 0.4));

    if (activity.kind === 'gathering') {
      const trunk = this.add.rectangle(0, -35, 18, 70, 0x5a3a1a);
      trunk.setStrokeStyle(2, 0x3a1a0a);
      c.add(trunk);
      const crown1 = this.add.triangle(0, -85, -40, 30, 0, -40, 40, 30, 0x3a8a4a);
      crown1.setStrokeStyle(2, 0x1a4a2a);
      c.add(crown1);
      const crown2 = this.add.triangle(0, -105, -35, 25, 0, -35, 35, 25, 0x4a9a5a);
      crown2.setStrokeStyle(2, 0x1a4a2a);
      c.add(crown2);
      c.add(this.add.triangle(-10, -110, -15, 15, 0, -15, 15, 15, 0xffffff, 0.15));
    } else {
      const bench = this.add.rectangle(0, -25, 100, 50, 0x5a3a1a);
      bench.setStrokeStyle(2, 0x3a1a0a);
      c.add(bench);
      const top = this.add.rectangle(0, -50, 110, 10, 0x8a6a3a);
      top.setStrokeStyle(2, 0x4a3a1a);
      c.add(top);
      const tool = this.add.rectangle(0, -60, 40, 12, 0x4a4a5a);
      tool.setStrokeStyle(1, 0x2a2a3a);
      c.add(tool);
      c.add(this.add.circle(0, -75, 3, 0xffdd88));
    }

    this.nodeContainer = c;

    const container = this.add.container(x, y + 20).setDepth(99);
    const border = this.add.rectangle(0, 0, ACTIVITY_BAR_WIDTH + 4, ACTIVITY_BAR_HEIGHT + 4, 0x1a0f2a);
    const bg = this.add.rectangle(0, 0, ACTIVITY_BAR_WIDTH, ACTIVITY_BAR_HEIGHT, 0x1a1428);
    const fill = this.add.rectangle(-ACTIVITY_BAR_WIDTH / 2, 0, 0, ACTIVITY_BAR_HEIGHT, 0x6ab87a).setOrigin(0, 0.5);
    container.add([border, bg, fill]);
    this.activityBarContainer = container;
    this.activityBarFill = fill;
    this.lastActivityProgress = -1;
  }

  private destroyNode(): void {
    if (this.nodeContainer) { this.nodeContainer.destroy(); this.nodeContainer = null; }
    if (this.activityBarContainer) { this.activityBarContainer.destroy(); this.activityBarContainer = null; }
    this.activityBarFill = null;
    this.lastActivityProgress = -1;
  }

  /* ============== ANIMATIONS ============== */

  private tickCombatAnimation(): void {
    if (!this.services) return;
    const combat = this.services.getCombatSession();
    if (!combat) { this.lastLogLength = 0; this.lastKills = 0; return; }

    if (combat.kills > this.lastKills) {
      this.lastKills = combat.kills;
      this.spawnFloatingText('+KILL', GAME_CONFIG.width * MONSTER_X_RATIO, GAME_CONFIG.height * GROUND_Y_RATIO - 200, '#d4a24e', 26);
    }

    const logLen = combat.log.length;
    if (logLen > this.lastLogLength && this.lastLogLength > 0) {
      const newEvents = combat.log.slice(this.lastLogLength);
      for (const ev of newEvents) {
        if (ev.kind === 'player-basic') {
          this.animatePlayerAttack();
          this.spawnFloatingText('-' + ev.damage, GAME_CONFIG.width * MONSTER_X_RATIO, GAME_CONFIG.height * GROUND_Y_RATIO - 90, ev.crit ? '#ffdd88' : '#ff8888', ev.crit ? 28 : 22);
        } else if (ev.kind === 'player-skill') {
          this.animatePlayerAttack();
          if (ev.damage > 0) this.spawnFloatingText('-' + ev.damage, GAME_CONFIG.width * MONSTER_X_RATIO, GAME_CONFIG.height * GROUND_Y_RATIO - 90, '#ffcc66', 26);
          if (ev.heal > 0) this.spawnFloatingText('+' + ev.heal, GAME_CONFIG.width * PLAYER_X_RATIO, GAME_CONFIG.height * GROUND_Y_RATIO - 90, '#7ad4a0', 22);
        } else if (ev.kind === 'monster-basic') {
          this.animateMonsterAttack();
          this.spawnFloatingText('-' + ev.damage, GAME_CONFIG.width * PLAYER_X_RATIO, GAME_CONFIG.height * GROUND_Y_RATIO - 90, '#e088a0', 20);
        }
      }
    }
    this.lastLogLength = logLen;

    this.updateMonsterHpBar(combat.monsterHp, combat.monsterMaxHp);
  }

  private tickActivityAnimation(): void {
    if (!this.services) return;
    const activity = this.services.getActivity();
    if (!activity || !this.activityBarFill) return;
    const pct = activity.batches > 0 ? Math.min(1, activity.completedActions / activity.batches) : 0;
    if (pct === this.lastActivityProgress) return;
    this.lastActivityProgress = pct;
    this.activityBarFill.width = ACTIVITY_BAR_WIDTH * pct;
  }

  private animatePlayerAttack(): void {
    const startX = this.playerContainer.x;
    this.tweens.add({
      targets: this.playerContainer,
      x: startX + 40,
      duration: 140,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private animateMonsterAttack(): void {
    if (!this.monsterContainer) return;
    const startX = this.monsterContainer.x;
    this.tweens.add({
      targets: this.monsterContainer,
      x: startX - 30,
      duration: 140,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private spawnFloatingText(text: string, x: number, y: number, color: string, size: number): void {
    const t = this.add.text(x, y, text, {
      fontFamily: 'Georgia, serif',
      fontSize: size + 'px',
      color,
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: t,
      y: y - 70,
      alpha: 0,
      duration: 1100,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy(),
    });
  }
}