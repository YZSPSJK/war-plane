(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const ui = {
    gameShell: document.querySelector(".game-shell"),
    mainMenu: document.getElementById("mainMenu"),
    accountFighter: document.getElementById("accountFighter"),
    accountCoins: document.getElementById("accountCoins"),
    accountTickets: document.getElementById("accountTickets"),
    accountUnlocked: document.getElementById("accountUnlocked"),
    mainStartButton: document.getElementById("mainStartButton"),
    fighterInfoButton: document.getElementById("fighterInfoButton"),
    levelName: document.getElementById("levelName"),
    waveInfo: document.getElementById("waveInfo"),
    phaseInfo: document.getElementById("phaseInfo"),
    heroInfo: document.getElementById("heroInfo"),
    killInfo: document.getElementById("killInfo"),
    skillInfo: document.getElementById("skillInfo"),
    skillPoolInfo: document.getElementById("skillPoolInfo"),
    enemyHpInfo: document.getElementById("enemyHpInfo"),
    dropInfo: document.getElementById("dropInfo"),
    economyInfo: document.getElementById("economyInfo"),
    fighterButton: document.getElementById("fighterButton"),
    exitGameButton: document.getElementById("exitGameButton"),
    fighterDialog: document.getElementById("fighterDialog"),
    fighterSource: document.getElementById("fighterSource"),
    fighterWallet: document.getElementById("fighterWallet"),
    fighterTrack: document.getElementById("fighterTrack"),
    fighterDots: document.getElementById("fighterDots"),
    fighterPrevButton: document.getElementById("fighterPrevButton"),
    fighterNextButton: document.getElementById("fighterNextButton"),
    drawFighterButton: document.getElementById("drawFighterButton"),
    startFighterButton: document.getElementById("startFighterButton"),
    fighterInfoPage: document.getElementById("fighterInfoPage"),
    fighterInfoSource: document.getElementById("fighterInfoSource"),
    fighterInfoWallet: document.getElementById("fighterInfoWallet"),
    fighterInfoTrack: document.getElementById("fighterInfoTrack"),
    fighterInfoDots: document.getElementById("fighterInfoDots"),
    fighterInfoPrevButton: document.getElementById("fighterInfoPrevButton"),
    fighterInfoNextButton: document.getElementById("fighterInfoNextButton"),
    fighterInfoCloseButton: document.getElementById("fighterInfoCloseButton"),
    fighterUpgradeButton: document.getElementById("fighterUpgradeButton"),
    fighterUpgradePage: document.getElementById("fighterUpgradePage"),
    fighterUpgradeSource: document.getElementById("fighterUpgradeSource"),
    fighterUpgradeTitle: document.getElementById("fighterUpgradeTitle"),
    fighterUpgradeWallet: document.getElementById("fighterUpgradeWallet"),
    fighterUpgradeTrack: document.getElementById("fighterUpgradeTrack"),
    fighterUpgradeBackButton: document.getElementById("fighterUpgradeBackButton"),
    fighterUpgradeResetButton: document.getElementById("fighterUpgradeResetButton"),
    moveLeft: document.getElementById("moveLeft"),
    moveRight: document.getElementById("moveRight"),
    dialog: document.getElementById("resultDialog"),
    resultTitle: document.getElementById("resultTitle"),
    resultText: document.getElementById("resultText"),
    retryButton: document.getElementById("retryButton"),
    resultHomeButton: document.getElementById("resultHomeButton"),
    nextButton: document.getElementById("nextButton"),
    exitDialog: document.getElementById("exitDialog"),
    exitCancelButton: document.getElementById("exitCancelButton"),
    exitConfirmButton: document.getElementById("exitConfirmButton"),
    choiceDialog: document.getElementById("choiceDialog"),
    choiceSource: document.getElementById("choiceSource"),
    choiceTitle: document.getElementById("choiceTitle"),
    choiceCount: document.getElementById("choiceCount"),
    choiceCards: document.getElementById("choiceCards"),
    giftDialog: document.getElementById("giftDialog"),
    celebrationLayer: document.getElementById("celebrationLayer"),
    giftSource: document.getElementById("giftSource"),
    giftTitle: document.getElementById("giftTitle"),
    giftCount: document.getElementById("giftCount"),
    giftItems: document.getElementById("giftItems")
  };

  const { balance, levelOrder, levelConfigs, fighters, fighterEffects } = window.NeonConfig;
  const { readProgress, writeProgress } = window.NeonProgress;
  const { rollChestChoiceCount, rollRarity, generateChoiceCards } = window.NeonRewards;
  const fighterMap = Object.fromEntries(fighters.map((fighter) => [fighter.key, fighter]));
  const fighterGameImages = new Map();

  const state = {
    dpr: 1,
    w: 0,
    h: 0,
    play: rect(0, 0, 0, 0),
    road: rect(0, 0, 0, 0),
    wall: rect(0, 0, 0, 0),
    chestLane: rect(0, 0, 0, 0),
    enemyLane: rect(0, 0, 0, 0),
    hero: { x: 0, y: 0 },
    heroHp: balance.heroBaseHp,
    heroMaxHp: balance.heroBaseHp,
    input: { left: false, right: false, pointer: false },
    projectiles: [],
    enemies: [],
    effects: [],
    particles: [],
    levelIndex: 1,
    levelId: "level1",
    levelCfg: levelConfigs.level1,
    chestHp: balance.chest.maxHp,
    chestsOpened: 0,
    upgrades: { bulletCount: 0, fireRate: 0, pierce: 0, damage: 0, damagePenalty: 0 },
    lastReward: "",
    killCount: 0,
    killsByPhase: [0, 0, 0, 0],
    heroLevel: 1,
    xp: 0,
    xpNeed: balance.progression.xpRequirements[0],
    nextLevelIndex: 0,
    earnedGold: 0,
    wallet: { coins: 0, drawTickets: 0 },
    fighterUpgrades: {},
    selectedFighterId: "basic_fighter",
    piercingTargetId: null,
    piercingFireRateBonus: 0,
    piercingRetainNextTarget: false,
    fighterPreviewIndex: 0,
    fighterInfoIndex: 0,
    fighterDialogInitial: false,
    shootTimer: 0,
    nextWave: 1,
    activeWave: 1,
    phase: 0,
    phaseSpawnLeft: 0,
    phaseSpawnQueue: [],
    phaseUnitHp: 1,
    enemyHpPressureTimer: 0,
    enemyHpPressureMultiplier: 1,
    phaseTimer: 0,
    nextEnemyId: 1,
    gameOver: false,
    victory: false,
    paused: false,
    pendingChoiceCount: 0,
    gift: { active: false, total: 0, remaining: 0 },
    choice: { active: false, source: "", title: "", cards: [] },
    pendingLevelChoices: 0,
    lastTime: 0,
    elapsed: 0,
    deathBossSpawned: false,
    configScale: { hp: 1, speed: 1, spawn: 1 },
    backgroundCache: null
  };

  for (const fighter of fighters) {
    if (!fighter.gameImage) continue;
    const image = new Image();
    image.src = fighter.gameImage;
    fighterGameImages.set(fighter.key, image);
  }

  function rect(x, y, w, h) {
    return { x, y, w, h };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pointInRect(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  function growRect(r, value) {
    return rect(r.x - value, r.y - value, r.w + value * 2, r.h + value * 2);
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function currentFighter() {
    return fighterMap[state.selectedFighterId] || fighters[0];
  }

  function fighterIndexById(fighterId) {
    return Math.max(0, fighters.findIndex((fighter) => fighter.key === fighterId));
  }

  function previewFighter() {
    return fighters[state.fighterPreviewIndex] || fighters[0];
  }

  function isFighterOwned(progress, fighterId) {
    return !!(progress.fighters && progress.fighters[fighterId] && progress.fighters[fighterId].owned);
  }

  function syncWalletFromProgress() {
    const progress = readProgress();
    state.wallet = {
      coins: progress.coins || 0,
      drawTickets: progress.drawTickets || 0
    };
    state.fighterUpgrades = progress.fighterUpgrades || {};
    const previousFighterId = state.selectedFighterId;
    state.selectedFighterId = progress.selectedFighter || "basic_fighter";
    if (!fighterMap[state.selectedFighterId] || !isFighterOwned(progress, state.selectedFighterId)) {
      state.selectedFighterId = "basic_fighter";
    }
    if (previousFighterId !== state.selectedFighterId) resetPiercingMomentum();
    state.fighterPreviewIndex = fighterIndexById(state.selectedFighterId);
  }

  function saveSelectedFighter(fighterId) {
    const progress = readProgress();
    if (!isFighterOwned(progress, fighterId)) return;
    progress.selectedFighter = fighterId;
    writeProgress(progress);
    syncWalletFromProgress();
  }

  function normalizedFighterUpgrade(fighterId, progress = null) {
    const source = progress ? progress.fighterUpgrades || {} : state.fighterUpgrades || {};
    return {
      damage: 0,
      fireRate: 0,
      bulletCount: 0,
      health: 0,
      hit: 0,
      kill: fighterId === "basic_fighter",
      ...(source[fighterId] || {})
    };
  }

  function currentFighterStats() {
    const fighter = currentFighter();
    return (fighter.info && fighter.info.stats) || { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp };
  }

  function currentBulletCount() {
    const stats = currentFighterStats();
    const fighterUpgrade = normalizedFighterUpgrade(state.selectedFighterId);
    return Math.min(balance.upgradeCaps.bulletCount, stats.bulletCount + fighterUpgrade.bulletCount + state.upgrades.bulletCount);
  }

  function currentBulletSpeed() {
    return balance.projectileSpeed;
  }

  function currentBulletDamage() {
    const stats = currentFighterStats();
    const fighterUpgrade = normalizedFighterUpgrade(state.selectedFighterId);
    const damagePenalty = Math.pow(0.75, state.upgrades.damagePenalty || 0);
    return balance.heroBaseAttack * stats.damage * (1 + state.upgrades.damage + fighterUpgrade.damage * 0.2) * damagePenalty;
  }

  function currentPierce() {
    return Math.min(balance.upgradeCaps.pierce, state.upgrades.pierce);
  }

  function currentHeroMaxHp() {
    const stats = currentFighterStats();
    const fighterUpgrade = normalizedFighterUpgrade(state.selectedFighterId);
    return (stats.health || balance.heroBaseHp) + fighterUpgrade.health * balance.heroHpUpgradeStep;
  }

  function enemyHpPressureMultiplier() {
    return state.enemyHpPressureMultiplier;
  }

  function shootInterval() {
    const stats = currentFighterStats();
    const fighterUpgrade = normalizedFighterUpgrade(state.selectedFighterId);
    const piercingBonus = state.selectedFighterId === "piercing_fighter" ? state.piercingFireRateBonus : 0;
    return balance.shootInterval / (stats.fireRate * (1 + state.upgrades.fireRate + fighterUpgrade.fireRate * 0.1 + piercingBonus));
  }

  function currentChestMaxHp() {
    let hp = balance.chest.maxHp;
    const multiplier = balance.chest.hpGrowthMultiplier || 1;
    const roundStep = balance.chest.hpRoundStep || 1;
    for (let i = 0; i < state.chestsOpened; i += 1) {
      hp = Math.ceil((hp * multiplier) / roundStep) * roundStep;
    }
    return hp;
  }

  function resetPiercingMomentum() {
    state.piercingTargetId = null;
    state.piercingFireRateBonus = 0;
    state.piercingRetainNextTarget = false;
  }

  function phaseName() {
    if (state.phase === 0) return "混合敌群";
    if (state.phase === 1) return "精英怪";
    if (state.phase === 3) return balance.deathBoss.name;
    return "Boss";
  }

  function activeEnemyRadius() {
    if (state.phase === 0) return 10;
    if (state.phase === 1) return 13;
    if (state.phase === 3) return 34;
    return 28;
  }

  function enemyRadius(enemy) {
    if (enemy.phase === 0) return 10;
    if (enemy.phase === 1) return 13;
    if (enemy.phase === 3) return 34;
    return 28;
  }

  function resize() {
    state.dpr = 1;
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = state.w;
    canvas.height = state.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    state.backgroundCache = null;
    layoutWorld();
  }

  function layoutWorld() {
    const compactHud = state.w <= 620;
    const topReserved = compactHud ? 190 : 86;
    const bottomReserved = 56;
    const sideMargin = state.w * 0.08;
    state.play = rect(sideMargin, topReserved, state.w - sideMargin * 2, state.h - topReserved - bottomReserved);
    const roadWidth = clamp(state.w * 0.12, 28, 54);
    let roadHeight = state.play.h * 0.62;
    const roadTop = state.play.y + state.play.h * 0.08;
    roadHeight = Math.max(220, Math.min(roadHeight, state.play.y + state.play.h - 180 - roadTop));
    state.road = rect(state.play.x + state.play.w / 2 - roadWidth * 0.95, roadTop, roadWidth * 1.9, roadHeight);
    state.wall = rect(state.play.x + state.play.w / 2 - roadWidth * 0.5, roadTop, roadWidth, roadHeight);
    const laneTop = state.road.y + 26;
    const laneBottom = state.road.y + state.road.h - 18;
    state.chestLane = rect(state.play.x + 20, laneTop, state.wall.x - state.play.x - 40, laneBottom - laneTop);
    state.enemyLane = rect(state.wall.x + state.wall.w + 20, laneTop, state.play.x + state.play.w - (state.wall.x + state.wall.w) - 40, laneBottom - laneTop);
    if (!state.hero.x) state.hero.x = state.play.x + state.play.w / 2;
    state.hero.y = state.play.y + state.play.h - 56;
    state.hero.x = clamp(state.hero.x, state.play.x + 34, state.play.x + state.play.w - 34);
  }

  function initLevel(levelIndex = state.levelIndex) {
    state.levelIndex = clamp(levelIndex, 0, levelOrder.length - 1);
    state.levelId = levelOrder[state.levelIndex];
    state.levelCfg = levelConfigs[state.levelId];
    state.configScale = { hp: state.levelCfg.hp, speed: state.levelCfg.speed, spawn: state.levelCfg.spawn };
    state.hero.x = 0;
    state.projectiles = [];
    state.enemies = [];
    state.effects = [];
    state.particles = [];
    syncWalletFromProgress();
    state.heroMaxHp = currentHeroMaxHp();
    state.heroHp = state.heroMaxHp;
    state.chestsOpened = 0;
    state.chestHp = currentChestMaxHp();
    state.upgrades = { bulletCount: 0, fireRate: 0, pierce: 0, damage: 0, damagePenalty: 0 };
    resetPiercingMomentum();
    state.lastReward = "";
    state.killCount = 0;
    state.killsByPhase = [0, 0, 0, 0];
    state.heroLevel = 1;
    state.xp = 0;
    state.nextLevelIndex = 0;
    state.xpNeed = balance.progression.xpRequirements[0];
    state.earnedGold = 0;
    state.shootTimer = 0;
    state.nextWave = 1;
    state.activeWave = 1;
    state.phase = 0;
    state.phaseSpawnLeft = 0;
    state.phaseSpawnQueue = [];
    state.phaseUnitHp = 1;
    state.enemyHpPressureTimer = 0;
    state.enemyHpPressureMultiplier = 1;
    state.phaseTimer = 0;
    state.nextEnemyId = 1;
    state.gameOver = false;
    state.victory = false;
    state.paused = false;
    state.pendingChoiceCount = 0;
    state.gift = { active: false, total: 0, remaining: 0 };
    state.choice = { active: false, source: "", title: "", cards: [] };
    state.pendingLevelChoices = 0;
    state.elapsed = 0;
    state.deathBossSpawned = false;
    writeProgress(readProgress());
    layoutWorld();
    startNextStage();
    closeDialog(ui.dialog);
    closeDialog(ui.exitDialog);
    closeDialog(ui.choiceDialog);
    closeDialog(ui.giftDialog);
    closeDialog(ui.fighterDialog);
    updateUi();
  }

  function startNextStage() {
    if (state.nextWave <= balance.totalWaves) {
      startWave(state.nextWave);
      state.nextWave += 1;
      return;
    }
    startBoss();
  }

  function startWave(wave) {
    state.activeWave = wave;
    const count = Math.max(1, balance.waveBaseCount + (wave - 1) * balance.waveCountStep);
    const eliteCount = balance.eliteCount;
    const normalHp = balance.swarmHp * state.configScale.hp;
    const eliteHp = balance.eliteHp * state.configScale.hp;
    startPhase(0, count + eliteCount, normalHp, buildMixedWaveQueue(count, normalHp, eliteCount, eliteHp));
  }

  function startElite() {
    const count = balance.eliteCount;
    startPhase(1, count, balance.eliteHp * state.configScale.hp);
  }

  function startBoss() {
    state.activeWave = balance.totalWaves;
    startPhase(2, 1, balance.bossMaxHp * state.configScale.hp);
  }

  function startDeathBoss() {
    state.deathBossSpawned = true;
    state.activeWave = balance.totalWaves;
    state.projectiles = [];
    startPhase(3, 1, balance.deathBoss.hp * state.configScale.hp);
    state.lastReward = `${balance.deathBoss.name} 已出现`;
    burst(state.enemyLane.x + state.enemyLane.w / 2, state.enemyLane.y + 42, "#e7f7ff", 18);
  }

  function buildMixedWaveQueue(normalCount, normalHp, eliteCount, eliteHp) {
    const total = normalCount + eliteCount;
    const queue = [];
    let normalPlaced = 0;
    let elitePlaced = 0;
    for (let i = 0; i < total; i += 1) {
      const expectedElite = Math.floor(((i + 1) * eliteCount) / total);
      if (elitePlaced < eliteCount && expectedElite > elitePlaced) {
        queue.push({ phase: 1, hp: eliteHp });
        elitePlaced += 1;
      } else if (normalPlaced < normalCount) {
        queue.push({ phase: 0, hp: normalHp });
        normalPlaced += 1;
      } else {
        queue.push({ phase: 1, hp: eliteHp });
        elitePlaced += 1;
      }
    }
    return queue;
  }

  function startPhase(phase, count, unitHp, spawnQueue = []) {
    state.phase = phase;
    state.enemies = [];
    state.phaseSpawnLeft = count;
    state.phaseSpawnQueue = spawnQueue.slice();
    state.phaseUnitHp = unitHp;
    state.phaseTimer = 0;
  }

  function spawnEnemy() {
    const spawn = state.phaseSpawnQueue.length ? state.phaseSpawnQueue.shift() : { phase: state.phase, hp: state.phaseUnitHp };
    const radius = spawn.phase === 0 ? 10 : spawn.phase === 1 ? 13 : activeEnemyRadius();
    const isBoss = state.phase >= 2;
    const hp = spawn.phase >= 2 ? spawn.hp : spawn.hp * enemyHpPressureMultiplier();
    state.enemies.push({
      id: state.nextEnemyId++,
      x: isBoss ? state.enemyLane.x + state.enemyLane.w / 2 : rand(state.enemyLane.x + radius + 2, state.enemyLane.x + state.enemyLane.w - radius - 2),
      y: state.enemyLane.y + radius + 4,
      hp,
      maxHp: hp,
      phase: spawn.phase
    });
  }

  function updateEnemyHpPressure(delta) {
    const pressure = balance.enemyHpPressure;
    const currentSwarmHp = balance.swarmHp * state.configScale.hp * state.enemyHpPressureMultiplier;
    const twoShotDamage = currentBulletDamage() * currentBulletCount() * 2;
    if (currentSwarmHp <= twoShotDamage) {
      state.enemyHpPressureTimer += delta;
      if (state.enemyHpPressureTimer >= pressure.triggerSeconds) {
        state.enemyHpPressureMultiplier *= pressure.growthMultiplier;
        state.enemyHpPressureTimer = 0;
        state.lastReward = "后续怪物血量 +50%";
      }
      return;
    }
    state.enemyHpPressureTimer = 0;
  }

  function update(delta) {
    if (state.gameOver || state.victory || state.paused) return;
    state.elapsed += delta;
    if (shouldStartDeathBoss()) startDeathBoss();
    updateHero(delta);
    updateEnemyHpPressure(delta);
    updateShooting(delta);
    updateEnemySpawn(delta);
    updateProjectiles(delta);
    updateStatusEffects(delta);
    updateAreaEffects(delta);
    updateEnemies(delta);
    checkFail();
    checkStageAdvance();
    updateParticles(delta);
  }

  function updateHero(delta) {
    let dir = 0;
    if (state.input.left) dir -= 1;
    if (state.input.right) dir += 1;
    state.hero.x = clamp(state.hero.x + dir * balance.heroSpeed * delta, state.play.x + 34, state.play.x + state.play.w - 34);
  }

  function updateShooting(delta) {
    state.shootTimer += delta;
    const interval = shootInterval();
    while (state.shootTimer >= interval) {
      state.shootTimer -= interval;
      spawnUpwardBullets(state.hero.x, state.hero.y - 24);
    }
  }

  function spawnUpwardBullets(x, y) {
    const count = currentBulletCount();
    const center = (count - 1) * 0.5;
    for (let i = 0; i < count; i += 1) {
      spawnProjectile(x + (i - center) * 10, y, 0, -currentBulletSpeed(), currentBulletDamage(), currentPierce());
    }
  }

  function spawnProjectile(x, y, vx, vy, damage, pierceLeft = 0, options = {}) {
    state.projectiles.push({
      x,
      y,
      vx,
      vy,
      damage,
      pierceLeft,
      fighterId: options.fighterId || currentFighter().key,
      kind: options.kind || "basic",
      age: 0,
      maxAge: options.maxAge || null,
      hitRadius: options.hitRadius || balance.projectileHitRadius,
      canTriggerHitEffect: options.canTriggerHitEffect !== false,
      canTriggerKillEffect: options.canTriggerKillEffect !== false,
      travel: 0,
      hitIds: options.hitIds ? options.hitIds.slice() : []
    });
  }

  function updateProjectiles(delta) {
    const bounds = growRect(state.play, 100);
    const next = [];
    for (const p of state.projectiles) {
      const dx = p.vx * delta;
      const dy = p.vy * delta;
      p.x += dx;
      p.y += dy;
      p.age = (p.age || 0) + delta;
      p.travel += Math.hypot(dx, dy);
      if (p.maxAge && p.age >= p.maxAge) continue;
      if (!pointInRect(p, bounds)) continue;
      let consumed = false;
      if (p.travel >= balance.projectileArmDistance) consumed = applyProjectileHit(p);
      if (!consumed) next.push(p);
    }
    state.projectiles = next;
  }

  function applyProjectileHit(projectile) {
    const wallCenter = state.wall.x + state.wall.w / 2;
    if (projectile.x < wallCenter) return hitChest(projectile);
    return hitEnemySide(projectile);
  }

  function chestBounds() {
    const size = clamp(Math.min(state.chestLane.w, state.chestLane.h) * 0.46, 82, 132);
    return rect(state.chestLane.x + state.chestLane.w / 2 - size / 2, state.chestLane.y + state.chestLane.h * 0.42 - size / 2, size, size);
  }

  function hitChest(projectile) {
    if (!pointInRect(projectile, growRect(chestBounds(), balance.projectileHitRadius))) return false;
    state.chestHp = Math.max(0, state.chestHp - balance.chest.damagePerHit);
    burst(projectile.x, projectile.y, "#ffb238", 2);
    if (state.chestHp <= 0) {
      state.chestsOpened += 1;
      state.chestHp = currentChestMaxHp();
      openGifts(rollChestChoiceCount());
    }
    return true;
  }

  function hitEnemySide(projectile) {
    const hitRadius = projectile.hitRadius || balance.projectileHitRadius;
    const candidates = state.enemies.filter((enemy) => !projectile.hitIds.includes(enemy.id) && dist(projectile, enemy) <= hitRadius + enemyRadius(enemy));
    if (!candidates.length) return false;
    candidates.sort((a, b) => (a.x === b.x ? b.y - a.y : a.x - b.x));
    const target = candidates[0];
    projectile.hitIds.push(target.id);
    applyProjectileImpact(projectile, target);
    if (projectile.pierceLeft > 0) {
      projectile.pierceLeft -= 1;
      return false;
    }
    return true;
  }

  function applyProjectileImpact(projectile, target) {
    const fighter = fighterMap[projectile.fighterId] || currentFighter();
    if (projectile.canTriggerHitEffect) applyFighterHitEffect(fighter, target, projectile.damage);
    applyDamage(target.id, projectile.damage, { fighterId: fighter.key, triggerKillEffect: projectile.canTriggerKillEffect });
  }

  function fighterHitLevel(fighterId) {
    return normalizedFighterUpgrade(fighterId).hit || 0;
  }

  function isFighterKillUnlocked(fighterId) {
    return !!normalizedFighterUpgrade(fighterId).kill;
  }

  function flameBurnDamage() {
    return fighterEffects.flame.burnDamage + fighterHitLevel("flame_fighter") * 0.1;
  }

  function frostSlowFactor() {
    return Math.max(0.25, fighterEffects.frost.slowFactor - fighterHitLevel("frost_fighter") * 0.08);
  }

  function blastDamageRatio() {
    return fighterEffects.blast.damage + fighterHitLevel("blast_fighter") * 0.15;
  }

  function stormDamageRatio() {
    return fighterEffects.storm.damage + fighterHitLevel("storm_fighter") * 0.15;
  }

  function piercingFireRateStep() {
    return fighterEffects.piercing.fireRateStep + fighterHitLevel("piercing_fighter") * 0.06;
  }

  function fissionDamageRatio() {
    return fighterEffects.fission.damage + fighterHitLevel("fission_fighter") * 0.15;
  }

  function gravityKnockbackDistance() {
    return (24 + fighterHitLevel("gravity_fighter") * 8) * fighterEffects.gravity.knockbackScale;
  }

  function applyFighterHitEffect(fighter, target, damage) {
    if (fighter.key === "flame_fighter") {
      applyBurn(target.id);
      burst(target.x, target.y, fighter.color, 3);
      return;
    }
    if (fighter.key === "frost_fighter") {
      applySlow(target.id, fighterEffects.frost.slowDuration);
      burst(target.x, target.y, fighter.color, 3);
      return;
    }
    if (fighter.key === "blast_fighter") {
      explodeAt(target.x, target.y, damage * blastDamageRatio(), [target.id]);
      return;
    }
    if (fighter.key === "storm_fighter") {
      chainLightningFrom(target.x, target.y, [target.id], damage * stormDamageRatio(), fighterEffects.storm.jumps, false);
      return;
    }
    if (fighter.key === "piercing_fighter") {
      if (state.piercingTargetId !== target.id) {
        if (!state.piercingRetainNextTarget) state.piercingFireRateBonus = 0;
        state.piercingTargetId = target.id;
        state.piercingRetainNextTarget = false;
      }
      state.piercingFireRateBonus = Math.min(fighterEffects.piercing.maxFireRateBonus, state.piercingFireRateBonus + piercingFireRateStep());
      burst(target.x, target.y, fighter.color, Math.min(8, 2 + Math.round(state.piercingFireRateBonus * 10)));
      return;
    }
    if (fighter.key === "fission_fighter") {
      splitDamageFrom(target, damage * fissionDamageRatio());
      burst(target.x, target.y, fighter.color, 5);
      return;
    }
    if (fighter.key === "gravity_fighter") {
      target.y = Math.max(state.enemyLane.y + enemyRadius(target), target.y - gravityKnockbackDistance());
      burst(target.x, target.y, fighter.color, 4);
    }
  }

  function applyBurn(enemyId) {
    const enemy = state.enemies.find((item) => item.id === enemyId);
    if (!enemy) return;
    enemy.burnTime = Math.max(enemy.burnTime || 0, fighterEffects.flame.burnDuration);
    enemy.burnTick = enemy.burnTick || 0;
  }

  function applySlow(enemyId, duration) {
    const enemy = state.enemies.find((item) => item.id === enemyId);
    if (!enemy) return;
    enemy.slowTime = Math.max(enemy.slowTime || 0, duration);
  }

  function explodeAt(x, y, damage, ignoredIds = []) {
    burst(x, y, "#ffb238", 8);
    state.effects.push({ type: "explosion", x, y, radius: fighterEffects.blast.radius, timeLeft: 0.28, duration: 0.28 });
    for (const enemy of state.enemies.slice()) {
      if (ignoredIds.includes(enemy.id) || dist({ x, y }, enemy) > fighterEffects.blast.radius + enemyRadius(enemy)) continue;
      applyDamage(enemy.id, damage, { fighterId: "blast_fighter", triggerKillEffect: false });
    }
  }

  function chainLightningFrom(x, y, ignoredIds = [], damage, jumps, triggerKillEffect) {
    let origin = { x, y };
    const used = ignoredIds.slice();
    for (let i = 0; i < jumps; i += 1) {
      const candidates = state.enemies
        .filter((enemy) => !used.includes(enemy.id) && dist(origin, enemy) <= fighterEffects.storm.radius)
        .sort((a, b) => dist(origin, a) - dist(origin, b));
      if (!candidates.length) return;
      const target = candidates[0];
      state.effects.push({ type: "lightning", x1: origin.x, y1: origin.y, x2: target.x, y2: target.y, timeLeft: 0.16 });
      burst(target.x, target.y, "#b76cff", 4);
      applyDamage(target.id, damage, { fighterId: "storm_fighter", triggerKillEffect });
      used.push(target.id);
      origin = { x: target.x, y: target.y };
      damage *= fighterEffects.storm.falloff;
    }
  }

  function splitDamageFrom(source, damage) {
    const targets = state.enemies
      .filter((enemy) => enemy.id !== source.id && dist(source, enemy) <= fighterEffects.fission.radius)
      .sort((a, b) => dist(source, a) - dist(source, b))
      .slice(0, fighterEffects.fission.targets);
    for (const target of targets) {
      spawnSplitProjectile(source, target, damage);
    }
  }

  function spawnSplitProjectile(source, target, damage) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = currentBulletSpeed() * 1.12;
    spawnProjectile(source.x, source.y, (dx / distance) * speed, (dy / distance) * speed, damage, 0, {
      fighterId: "fission_fighter",
      kind: "split",
      maxAge: Math.min(0.42, distance / speed + 0.12),
      hitRadius: balance.projectileHitRadius + 2,
      canTriggerHitEffect: false,
      canTriggerKillEffect: false,
      hitIds: [source.id]
    });
  }

  function addBlackHole(x, y) {
    state.effects.push({
      type: "blackhole",
      x,
      y,
      radius: fighterEffects.gravity.radius,
      timeLeft: fighterEffects.gravity.duration
    });
  }

  function addAreaEffect(type, x, y) {
    if (type === "burn") {
      state.effects.push({
        type,
        x,
        y,
        radius: fighterEffects.flame.areaRadius,
        timeLeft: fighterEffects.flame.areaDuration,
        tick: 0
      });
      return;
    }
    state.effects.push({
      type,
      x,
      y,
      radius: fighterEffects.frost.shardRadius,
      timeLeft: fighterEffects.frost.shardDuration,
      tick: 0
    });
  }

  function applyFighterKillEffect(enemy, fighterId) {
    if (fighterId === "piercing_fighter") {
      if (isFighterKillUnlocked(fighterId)) {
        state.piercingRetainNextTarget = true;
      } else {
        resetPiercingMomentum();
      }
      return;
    }
    if (!isFighterKillUnlocked(fighterId)) return;
    if (fighterId === "flame_fighter") {
      addAreaEffect("burn", enemy.x, enemy.y);
      return;
    }
    if (fighterId === "frost_fighter") {
      addAreaEffect("ice", enemy.x, enemy.y);
      return;
    }
    if (fighterId === "storm_fighter") {
      chainLightningFrom(enemy.x, enemy.y, [enemy.id], currentBulletDamage() * stormDamageRatio(), 1, false);
      return;
    }
    if (fighterId === "blast_fighter") {
      explodeAt(enemy.x, enemy.y, currentBulletDamage() * blastDamageRatio(), [enemy.id]);
      return;
    }
    if (fighterId === "fission_fighter") {
      splitDamageFrom(enemy, currentBulletDamage() * fissionDamageRatio());
      return;
    }
    if (fighterId === "gravity_fighter") {
      addBlackHole(enemy.x, enemy.y);
    }
  }

  function updateEnemySpawn(delta) {
    if (state.phaseSpawnLeft <= 0) return;
    state.phaseTimer += delta;
    const base = state.phase === 0 ? balance.swarmSpawnInterval : balance.eliteSpawnInterval;
    const interval = state.phase >= 2 ? 0.1 : base / state.configScale.spawn;
    while (state.phaseTimer >= interval && state.phaseSpawnLeft > 0) {
      state.phaseTimer -= interval;
      spawnEnemy();
      state.phaseSpawnLeft -= 1;
    }
  }

  function updateStatusEffects(delta) {
    const burn = fighterEffects.flame;
    for (const enemy of state.enemies.slice()) {
      if (enemy.burnTime > 0) {
        enemy.burnTime = Math.max(0, enemy.burnTime - delta);
        enemy.burnTick = (enemy.burnTick || 0) + delta;
        while (enemy.burnTick >= burn.burnTick) {
          enemy.burnTick -= burn.burnTick;
          applyDamage(enemy.id, currentBulletDamage() * flameBurnDamage(), { fighterId: "flame_fighter", triggerKillEffect: true });
          if (!state.enemies.find((item) => item.id === enemy.id)) break;
        }
      }
      if (enemy.slowTime > 0) enemy.slowTime = Math.max(0, enemy.slowTime - delta);
    }
  }

  function updateAreaEffects(delta) {
    const next = [];
    for (const effect of state.effects) {
      effect.timeLeft -= delta;
      if (effect.type === "burn" || effect.type === "ice") {
        updateDamageArea(effect, delta);
      } else if (effect.type === "blackhole") {
        updateBlackHole(effect, delta);
      }
      if (effect.timeLeft > 0) next.push(effect);
    }
    state.effects = next;
  }

  function updateDamageArea(effect, delta) {
    const isBurn = effect.type === "burn";
    const config = isBurn ? fighterEffects.flame : fighterEffects.frost;
    const interval = isBurn ? config.burnTick : config.shardTick;
    const damage = currentBulletDamage() * (isBurn ? flameBurnDamage() : config.shardDamage);
    effect.tick += delta;
    while (effect.tick >= interval) {
      effect.tick -= interval;
      for (const enemy of state.enemies.slice()) {
        if (dist(effect, enemy) > effect.radius + enemyRadius(enemy)) continue;
        if (!isBurn) applySlow(enemy.id, config.slowDuration);
        applyDamage(enemy.id, damage, { fighterId: isBurn ? "flame_fighter" : "frost_fighter", triggerKillEffect: false });
      }
    }
  }

  function updateBlackHole(effect, delta) {
    for (const enemy of state.enemies) {
      const distance = dist(effect, enemy);
      if (distance <= 1 || distance > effect.radius) continue;
      const strength = 1 - distance / effect.radius;
      const step = Math.min(distance, fighterEffects.gravity.pullSpeed * (0.45 + strength) * delta);
      enemy.x += ((effect.x - enemy.x) / distance) * step;
      enemy.y += ((effect.y - enemy.y) / distance) * step;
    }
  }

  function updateEnemies(delta) {
    for (const enemy of state.enemies) {
      const baseSpeed = enemy.phase === 0 ? balance.swarmFallSpeed : enemy.phase === 1 ? balance.eliteFallSpeed : enemy.phase === 3 ? balance.deathBoss.fallSpeed : balance.bossFallSpeed;
      const slowFactor = enemy.slowTime > 0 ? frostSlowFactor() : 1;
      enemy.y += baseSpeed * state.configScale.speed * slowFactor * delta;
    }
  }

  function shouldStartDeathBoss() {
    return balance.deathBoss.enabled && !state.deathBossSpawned && state.elapsed >= balance.deathBoss.spawnAfterSeconds;
  }

  function checkFail() {
    for (const enemy of state.enemies.slice()) {
      if (enemy.y + enemyRadius(enemy) >= state.hero.y || dist(enemy, state.hero) <= balance.heroSize / 2 + enemyRadius(enemy)) {
        if (enemy.phase >= 2) {
          triggerGameOver();
          return;
        }
        state.enemies = state.enemies.filter((item) => item.id !== enemy.id);
        damageHero(enemy.phase === 1 ? balance.enemyDamage.elite : balance.enemyDamage.swarm, enemy);
        if (state.gameOver) return;
        burst(enemy.x, enemy.y, enemy.phase === 1 ? "#ff7a3d" : "#ff335d", 5);
      }
    }
  }

  function damageHero(amount, source) {
    state.heroHp = Math.max(0, state.heroHp - amount);
    state.lastReward = `战机受损 -${amount}`;
    burst(state.hero.x, state.hero.y, source.phase === 1 ? "#ff7a3d" : "#ff335d", 8);
    if (state.heroHp <= 0) {
      triggerGameOver();
      return;
    }
  }

  function checkStageAdvance() {
    if (state.phaseSpawnLeft > 0 || state.enemies.length > 0) return;
    if (state.phase === 0 || state.phase === 1) startNextStage();
    else if (state.phase === 2 && balance.deathBoss.enabled && !state.deathBossSpawned) {
      state.nextWave = 1;
      startNextStage();
    } else triggerVictory();
  }

  function xpForPhase(phase) {
    if (phase === 3) return balance.deathBoss.xp;
    return balance.xpByPhase[phase] || 0;
  }

  function goldForPhase(phase) {
    if (phase === 3) return balance.deathBoss.gold;
    return balance.goldByPhase[phase] || 0;
  }

  function applyDamage(enemyId, damage, options = {}) {
    const enemy = state.enemies.find((item) => item.id === enemyId);
    if (!enemy) return;
    enemy.hp -= damage;
    if (enemy.hp > 0) return;
    state.enemies = state.enemies.filter((item) => item.id !== enemyId);
    state.killCount += 1;
    state.killsByPhase[enemy.phase] = (state.killsByPhase[enemy.phase] || 0) + 1;
    state.earnedGold += goldForPhase(enemy.phase);
    gainXp(xpForPhase(enemy.phase));
    burst(enemy.x, enemy.y, enemy.phase >= 2 ? "#b76cff" : "#ff335d", enemy.phase === 3 ? 12 : 3);
    if (options.triggerKillEffect !== false) applyFighterKillEffect(enemy, options.fighterId || currentFighter().key);
  }

  function gainXp(amount) {
    const xpRequirements = balance.progression.xpRequirements;
    state.xp += amount;
    while (state.nextLevelIndex < xpRequirements.length && state.xp >= state.xpNeed) {
      state.xp -= state.xpNeed;
      state.heroLevel += 1;
      state.nextLevelIndex += 1;
      state.xpNeed = xpRequirements[state.nextLevelIndex] || Math.round(state.xpNeed * 1.25);
      state.pendingLevelChoices += 1;
    }
    if (!state.paused && state.pendingLevelChoices > 0) openPendingLevelChoice();
  }

  function openGifts(count) {
    state.paused = true;
    state.gift = { active: true, total: count, remaining: count, celebrated: false };
    renderGifts();
  }

  function renderGifts() {
    ui.giftSource.textContent = "宝箱已击碎";
    ui.giftTitle.textContent = "点击宝箱开启奖励";
    ui.giftCount.textContent = `${state.gift.total - state.gift.remaining + 1} / ${state.gift.total}`;
    ui.giftItems.innerHTML = "";
    if (!state.gift.celebrated) {
      renderCelebration();
      state.gift.celebrated = true;
    } else {
      ui.celebrationLayer.innerHTML = "";
    }
    for (let i = 0; i < state.gift.remaining; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gift-item";
      button.style.animationDelay = `${i * 70}ms`;
      button.innerHTML = "<span class=\"chest-icon\"><i></i><b></b></span>";
      button.addEventListener("click", () => {
        state.gift.remaining -= 1;
        closeDialog(ui.giftDialog);
        openChoice("宝箱奖励", "选择一个强化", "gift");
      });
      ui.giftItems.appendChild(button);
    }
    if (!ui.giftDialog.open) ui.giftDialog.showModal();
  }

  function renderCelebration() {
    const fireworks = Array.from({ length: 2 }, (_, i) => `<i class="firework f${i + 1}"></i>`).join("");
    const eggs = Array.from({ length: 2 }, (_, i) => `<i class="egg e${i + 1}"></i>`).join("");
    const sparks = Array.from({ length: 3 }, (_, i) => `<i class="spark s${i + 1}"></i>`).join("");
    ui.celebrationLayer.innerHTML = `${fireworks}${eggs}${sparks}`;
    window.setTimeout(() => {
      ui.celebrationLayer.innerHTML = "";
    }, 900);
  }

  function openPendingLevelChoice() {
    state.pendingLevelChoices -= 1;
    state.paused = true;
    openChoice("等级提升", "选择一个强化", "level");
  }

  function openChoice(source, title, kind) {
    state.paused = true;
    state.choice = { active: true, source, title, kind, cards: generateChoiceCards(state, kind) };
    renderChoice();
  }

  function renderChoice() {
    ui.choiceSource.textContent = state.choice.source;
    ui.choiceTitle.textContent = state.choice.title;
    ui.choiceCount.textContent = `${state.choice.cards.length} 选 1`;
    ui.choiceCards.innerHTML = "";
    for (const card of state.choice.cards) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `reward-card ${card.rarity.css}`;
      button.innerHTML = `<span class="card-icon ${card.icon}"></span><span class="rarity">${card.rarity.label}</span><h2>${card.title}</h2><p>${card.desc}</p>`;
      button.addEventListener("click", () => chooseCard(card));
      ui.choiceCards.appendChild(button);
    }
    if (!ui.choiceDialog.open) ui.choiceDialog.showModal();
  }

  function chooseCard(card) {
    const previousHeroHp = state.heroHp;
    card.apply(state);
    state.lastReward = card.title;
    if (card.id.startsWith("heal:")) state.lastReward = `${card.title} +${Math.round(state.heroHp - previousHeroHp)}HP`;
    state.choice.active = false;
    closeDialog(ui.choiceDialog);
    if (state.gift.remaining > 0) {
      renderGifts();
      return;
    }
    state.gift.active = false;
    ui.celebrationLayer.innerHTML = "";
    if (state.pendingLevelChoices > 0) {
      openPendingLevelChoice();
      return;
    }
    state.paused = false;
  }

  function settleGold(victory) {
    const progress = readProgress();
    const gain = state.earnedGold + (victory ? balance.clearGold : 0);
    const ticketGain = victory ? balance.clearTickets : 0;
    progress.coins = Math.max(0, (progress.coins || 0) + gain);
    progress.drawTickets = Math.max(0, (progress.drawTickets || 0) + ticketGain);
    if (victory) progress.unlockedLevelIndex = Math.max(progress.unlockedLevelIndex || 0, Math.min(state.levelIndex + 1, levelOrder.length - 1));
    writeProgress(progress);
    syncWalletFromProgress();
    return { gain, tickets: ticketGain, total: progress.coins, ticketTotal: progress.drawTickets };
  }

  function triggerGameOver() {
    state.gameOver = true;
    state.paused = true;
    state.projectiles = [];
    const gold = settleGold(false);
    showDialog("防线崩溃", `本局金币 +${gold.gain}，当前金币 ${gold.total}，抽奖券 ${gold.ticketTotal}。`, false);
  }

  function triggerVictory() {
    state.victory = true;
    state.paused = true;
    state.projectiles = [];
    const gold = settleGold(true);
    showDialog("同步完成", `${state.levelCfg.name} 已清空。本局金币 +${gold.gain}，抽奖券 +${gold.tickets}，当前金币 ${gold.total}，抽奖券 ${gold.ticketTotal}。`, true);
  }

  function showDialog(title, text, victory) {
    ui.resultTitle.textContent = title;
    ui.resultText.textContent = text;
    ui.resultHomeButton.hidden = victory;
    ui.nextButton.hidden = !victory;
    if (!ui.dialog.open) ui.dialog.showModal();
  }

  function openExitConfirm() {
    if (state.gameOver || state.victory || isPageOpen() || ui.dialog.open || ui.choiceDialog.open || ui.giftDialog.open || ui.fighterDialog.open) return;
    state.paused = true;
    if (!ui.exitDialog.open) ui.exitDialog.showModal();
  }

  function cancelExitConfirm() {
    closeDialog(ui.exitDialog);
    state.paused = false;
  }

  function confirmExitGame() {
    closeDialog(ui.exitDialog);
    initLevel(state.levelIndex);
    openMainMenu();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  function isPageOpen() {
    return !ui.mainMenu.hidden || !ui.fighterInfoPage.hidden || !ui.fighterUpgradePage.hidden;
  }

  function hidePages() {
    ui.mainMenu.hidden = true;
    ui.fighterInfoPage.hidden = true;
    ui.fighterUpgradePage.hidden = true;
  }

  function showPage(page) {
    hidePages();
    page.hidden = false;
    ui.gameShell.classList.add("is-page-mode");
  }

  function closePages() {
    hidePages();
    ui.gameShell.classList.remove("is-page-mode");
  }

  function renderMainMenu() {
    const progress = readProgress();
    const selected = fighterMap[progress.selectedFighter] || fighters[0];
    const unlockedCount = fighters.filter((fighter) => isFighterOwned(progress, fighter.key)).length;
    ui.accountFighter.textContent = selected.name;
    ui.accountCoins.textContent = `金币 ${progress.coins || 0}`;
    ui.accountTickets.textContent = `抽奖券 ${progress.drawTickets || 0}`;
    ui.accountUnlocked.textContent = `战机 ${unlockedCount} / ${fighters.length}`;
  }

  function openMainMenu() {
    closeDialog(ui.dialog);
    closeDialog(ui.exitDialog);
    closeDialog(ui.choiceDialog);
    closeDialog(ui.giftDialog);
    closeDialog(ui.fighterDialog);
    state.paused = true;
    state.input.left = false;
    state.input.right = false;
    state.input.pointer = false;
    syncWalletFromProgress();
    renderMainMenu();
    showPage(ui.mainMenu);
    updateUi();
  }

  function closeMainMenu() {
    closePages();
  }

  function startFromMainMenu() {
    closeMainMenu();
    openFighterDialog(true);
  }

  function openFighterDialog(initial = false) {
    if (ui.choiceDialog.open || ui.giftDialog.open || ui.dialog.open || !ui.fighterInfoPage.hidden || !ui.fighterUpgradePage.hidden) return;
    state.fighterDialogInitial = initial;
    state.paused = true;
    syncWalletFromProgress();
    state.fighterPreviewIndex = fighterIndexById(state.selectedFighterId);
    renderFighterDialog();
    if (!ui.fighterDialog.open) ui.fighterDialog.showModal();
  }

  function renderFighterDialog() {
    const progress = readProgress();
    const fighter = previewFighter();
    const owned = isFighterOwned(progress, fighter.key);
    const selected = progress.selectedFighter === fighter.key;
    const canBuy = !owned && (progress.coins || 0) >= fighter.cost;
    ui.fighterSource.textContent = state.fighterDialogInitial ? "初始选择" : "战机库";
    ui.fighterWallet.textContent = `金币 ${progress.coins || 0}｜券 ${progress.drawTickets || 0}`;
    ui.fighterTrack.innerHTML = "";
    const card = document.createElement("article");
    card.className = `fighter-card fighter-carousel-card${owned ? "" : " is-locked"}${selected ? " is-selected" : ""}`;
    card.style.setProperty("--fighter-color", fighter.color);
    const status = owned ? (selected ? "当前出战" : "已解锁") : `未解锁｜金币 ${fighter.cost}`;
    const actionText = owned ? "已解锁" : "金币解锁";
    const fighterImage = fighter.selectImage ? `<img src="${fighter.selectImage}" alt="${fighter.name}">` : `<span class="fighter-orbit"></span><span class="fighter-core"></span><span class="fighter-cockpit"></span><span class="fighter-engine"></span>`;
    card.innerHTML = `<div class="fighter-ship fighter-ship--${fighter.key}${fighter.selectImage ? " fighter-ship--image" : ""}">${fighterImage}</div><h2>${fighter.name}</h2><p>${fighter.desc}</p><small>${status}</small><button type="button"${owned || !canBuy ? " disabled" : ""}>${actionText}</button>`;
    card.querySelector("button").addEventListener("click", () => purchaseFighter(fighter.key));
    ui.fighterTrack.appendChild(card);
    renderFighterDots();
    ui.drawFighterButton.textContent = "返回主界面";
    ui.drawFighterButton.disabled = false;
    ui.startFighterButton.textContent = owned ? "开始游戏" : `金币 ${fighter.cost} 解锁`;
    ui.startFighterButton.disabled = !owned && !canBuy;
  }

  function renderFighterDots() {
    ui.fighterDots.innerHTML = "";
    for (let i = 0; i < fighters.length; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = i === state.fighterPreviewIndex ? "is-active" : "";
      dot.setAttribute("aria-label", `查看${fighters[i].name}`);
      dot.addEventListener("click", () => setFighterPreview(i));
      ui.fighterDots.appendChild(dot);
    }
  }

  function setFighterPreview(index) {
    state.fighterPreviewIndex = (index + fighters.length) % fighters.length;
    renderFighterDialog();
    updateUi();
  }

  function moveFighterPreview(step) {
    setFighterPreview(state.fighterPreviewIndex + step);
  }

  function openFighterInfoDialog() {
    syncWalletFromProgress();
    state.fighterInfoIndex = fighterIndexById(state.selectedFighterId);
    renderFighterInfoDialog();
    showPage(ui.fighterInfoPage);
  }

  function renderFighterInfoDialog() {
    const progress = readProgress();
    const fighter = fighters[state.fighterInfoIndex] || fighters[0];
    const owned = isFighterOwned(progress, fighter.key);
    const info = fighter.info || { stats: { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp } };
    const stats = info.stats || { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp };
    const status = owned ? "已解锁" : `未解锁｜金币 ${fighter.cost}`;
    ui.fighterInfoWallet.textContent = `金币 ${progress.coins || 0}｜券 ${progress.drawTickets || 0}`;
    ui.fighterInfoSource.textContent = `${state.fighterInfoIndex + 1} / ${fighters.length}`;
    ui.fighterInfoTrack.innerHTML = "";
    const card = document.createElement("article");
    card.className = `fighter-card fighter-carousel-card fighter-info-card${owned ? "" : " is-locked"}`;
    card.style.setProperty("--fighter-color", fighter.color);
    const image = fighter.selectImage ? `<img src="${fighter.selectImage}" alt="${fighter.name}">` : "";
    const upgradeItems = fighterUpgradeItems(fighter, stats, progress);
    const damageItem = upgradeItems.find((item) => item.key === "damage");
    const fireRateItem = upgradeItems.find((item) => item.key === "fireRate");
    const bulletCountItem = upgradeItems.find((item) => item.key === "bulletCount");
    const healthItem = upgradeItems.find((item) => item.key === "health");
    const hitItem = upgradeItems.find((item) => item.key === "hit");
    const killItem = upgradeItems.find((item) => item.key === "kill");
    card.innerHTML = `
      <div class="fighter-info-top">
        <div class="fighter-ship fighter-ship--${fighter.key} fighter-ship--image">${image}</div>
        <div>
          <h2>${fighter.name}</h2>
          <small>${status}</small>
        </div>
      </div>
      <div class="fighter-stat-bars">
        ${statBar("基础攻击", damageItem.currentValue, damageItem.maxValue, damageItem.current, "基础参数")}
        ${statBar("射速", fireRateItem.currentValue, fireRateItem.maxValue, fireRateItem.current, "基础参数")}
        ${statBar("攻击数量", bulletCountItem.currentValue, bulletCountItem.maxValue, bulletCountItem.current, "基础参数")}
        ${statBar("血量", healthItem.currentValue, healthItem.maxValue, healthItem.current, "基础参数")}
        ${statBar("命中", hitItem.currentValue, hitItem.maxValue, hitItem.current, hitItem.desc)}
        ${statBar("击败", killItem.currentValue, killItem.maxValue, killItem.current, killItem.desc)}
      </div>
    `;
    ui.fighterInfoTrack.appendChild(card);
    renderFighterInfoDots();
  }

  function statBar(label, value, max, displayValue, desc = "") {
    const width = clamp((value / max) * 100, 5, 100);
    return `<div class="fighter-stat-row"><span>${label}</span><div class="fighter-stat-main"><div class="fighter-stat-track"><i style="width: ${width}%"></i></div><em>${desc}</em></div><strong>${displayValue}</strong></div>`;
  }

  function renderFighterInfoDots() {
    ui.fighterInfoDots.innerHTML = "";
    for (let i = 0; i < fighters.length; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = i === state.fighterInfoIndex ? "is-active" : "";
      dot.setAttribute("aria-label", `查看${fighters[i].name}参数`);
      dot.addEventListener("click", () => setFighterInfoPreview(i));
      ui.fighterInfoDots.appendChild(dot);
    }
  }

  function setFighterInfoPreview(index) {
    state.fighterInfoIndex = (index + fighters.length) % fighters.length;
    renderFighterInfoDialog();
  }

  function moveFighterInfoPreview(step) {
    setFighterInfoPreview(state.fighterInfoIndex + step);
  }

  function openFighterUpgradePage() {
    renderFighterUpgradePage();
    showPage(ui.fighterUpgradePage);
  }

  function renderFighterUpgradePage() {
    const progress = readProgress();
    const fighter = fighters[state.fighterInfoIndex] || fighters[0];
    const info = fighter.info || { stats: { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp } };
    const stats = info.stats || { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp };
    ui.fighterUpgradeSource.textContent = `${state.fighterInfoIndex + 1} / ${fighters.length}`;
    ui.fighterUpgradeTitle.textContent = `${fighter.name}升级`;
    ui.fighterUpgradeWallet.textContent = `金币 ${progress.coins || 0}｜券 ${progress.drawTickets || 0}`;
    ui.fighterUpgradeTrack.innerHTML = "";
    for (const item of fighterUpgradeItems(fighter, stats, progress)) {
      const card = document.createElement("article");
      card.className = `upgrade-card ${item.unlockOnly ? "upgrade-card--unlock" : ""}${item.done ? " is-done" : ""}`;
      card.style.setProperty("--fighter-color", fighter.color);
      card.innerHTML = `
        <span>${item.group}</span>
        <h2>${item.title}</h2>
        <div class="upgrade-trend">
          <strong>${item.current}</strong>
          <i></i>
          <strong>${item.next}</strong>
        </div>
        <p>${item.desc}</p>
        <button type="button"${item.disabled ? " disabled" : ""}>${item.buttonText}</button>
      `;
      card.querySelector("button").addEventListener("click", () => upgradeFighterItem(fighter.key, item.key));
      ui.fighterUpgradeTrack.appendChild(card);
    }
  }

  function fighterUpgradeItems(fighter, stats, progress = readProgress()) {
    const upgrade = normalizedFighterUpgrade(fighter.key, progress);
    const damageLevel = Math.min(5, upgrade.damage || 0);
    const fireRateLevel = Math.min(5, upgrade.fireRate || 0);
    const bulletCountLevel = Math.min(3, upgrade.bulletCount || 0);
    const healthLevel = Math.min(5, upgrade.health || 0);
    const hitLevel = Math.min(5, upgrade.hit || 0);
    const killUnlocked = !!upgrade.kill;
    const damageValue = balance.heroBaseAttack * stats.damage * (1 + damageLevel * 0.2);
    const nextDamageValue = balance.heroBaseAttack * stats.damage * (1 + (damageLevel + 1) * 0.2);
    const fireRateValue = (1 / balance.shootInterval) * stats.fireRate * (1 + fireRateLevel * 0.1);
    const nextFireRateValue = (1 / balance.shootInterval) * stats.fireRate * (1 + (fireRateLevel + 1) * 0.1);
    const bulletCountValue = stats.bulletCount + bulletCountLevel;
    const healthValue = (stats.health || balance.heroBaseHp) + healthLevel * balance.heroHpUpgradeStep;
    const nextHealthValue = (stats.health || balance.heroBaseHp) + (healthLevel + 1) * balance.heroHpUpgradeStep;
    const hitMap = {
      basic_fighter: hitMetric("攻速强化", 0.1, 0.05, hitLevel, 0.35, "%", "基础伤害，攻击速度提升。"),
      flame_fighter: hitMetric("持续伤害", 0.32, 0.1, hitLevel, 0.82, "%", "命中后附加持续伤害。"),
      frost_fighter: hitMetric("减速数值", 0.45, 0.08, hitLevel, 0.85, "%", "命中后降低敌人速度。"),
      blast_fighter: hitMetric("范围伤害", 0.55, 0.15, hitLevel, 1.3, "%", "命中后产生范围伤害。"),
      storm_fighter: hitMetric("闪电链伤害", 0.55, 0.15, hitLevel, 1.3, "%", "命中后产生闪电链。"),
      piercing_fighter: hitMetric("攻速增幅", 0.18, 0.06, hitLevel, 0.48, "%", "命中增加攻速，切换目标重置。"),
      fission_fighter: hitMetric("分裂子弹伤害", 0.5, 0.15, hitLevel, 1.25, "%", "命中产生一颗分裂子弹。"),
      gravity_fighter: hitMetric("击退距离", 24 * fighterEffects.gravity.knockbackScale, 8 * fighterEffects.gravity.knockbackScale, hitLevel, 64 * fighterEffects.gravity.knockbackScale, "", "命中产生击退。")
    };
    const killMap = {
      basic_fighter: { title: "击败被动", current: "无", next: "无", currentValue: 0, nextValue: 0, maxValue: 1, desc: "基础战机无额外击败被动。" },
      flame_fighter: { title: "灼烧区域", current: "未解锁", next: "2秒", currentValue: 0, nextValue: 2, maxValue: 3, desc: "击败后生成灼烧区域。" },
      frost_fighter: { title: "减速区域", current: "未解锁", next: "2秒", currentValue: 0, nextValue: 2, maxValue: 3, desc: "击败后产生减速区域。" },
      blast_fighter: { title: "范围爆炸", current: "未解锁", next: "1次", currentValue: 0, nextValue: 1, maxValue: 1, desc: "击败后产生一次范围爆炸。" },
      storm_fighter: { title: "过载闪电", current: "未解锁", next: "1目标", currentValue: 0, nextValue: 1, maxValue: 1, desc: "击败后命中最近敌人。" },
      piercing_fighter: { title: "保留攻速", current: "未解锁", next: "保留", currentValue: 0, nextValue: 1, maxValue: 1, desc: "击败后保留攻速加成。" },
      fission_fighter: { title: "双分裂", current: "未解锁", next: "2颗", currentValue: 0, nextValue: 2, maxValue: 2, desc: "击败后产生两颗分裂子弹。" },
      gravity_fighter: { title: "黑洞牵引", current: "未解锁", next: "2秒", currentValue: 0, nextValue: 2, maxValue: 3, desc: "击败后生成黑洞牵引敌人。" }
    };
    const hit = hitMap[fighter.key] || hitMap.basic_fighter;
    const kill = killMap[fighter.key] || killMap.basic_fighter;
    const canUpgrade = isFighterOwned(progress, fighter.key);
    const coins = progress.coins || 0;
    return [
      upgradeItem({ key: "damage", group: "基础参数", title: "基础攻击", current: damageValue.toFixed(1), next: nextDamageValue.toFixed(1), currentValue: damageValue, nextValue: nextDamageValue, maxValue: balance.heroBaseAttack * stats.damage * 2.2, cost: 80 * (damageLevel + 1), level: damageLevel, maxLevel: 5, desc: "提升每发子弹造成的基础伤害。", canUpgrade, coins }),
      upgradeItem({ key: "fireRate", group: "基础参数", title: "射速", current: `${fireRateValue.toFixed(1)}/秒`, next: `${nextFireRateValue.toFixed(1)}/秒`, currentValue: fireRateValue, nextValue: nextFireRateValue, maxValue: (1 / balance.shootInterval) * stats.fireRate * 1.7, cost: 90 * (fireRateLevel + 1), level: fireRateLevel, maxLevel: 5, desc: "缩短射击间隔，提升持续输出。", canUpgrade, coins }),
      upgradeItem({ key: "bulletCount", group: "基础参数", title: "攻击数量", current: `${bulletCountValue}`, next: `${bulletCountValue + 1}`, currentValue: bulletCountValue, nextValue: bulletCountValue + 1, maxValue: stats.bulletCount + 4, cost: 120 * (bulletCountLevel + 1), level: bulletCountLevel, maxLevel: 3, desc: "增加每轮攻击发射数量。", canUpgrade, coins }),
      upgradeItem({ key: "health", group: "基础参数", title: "血量", current: `${healthValue}`, next: `${nextHealthValue}`, currentValue: healthValue, nextValue: nextHealthValue, maxValue: (stats.health || balance.heroBaseHp) + balance.heroHpUpgradeStep * 5, cost: 100 * (healthLevel + 1), level: healthLevel, maxLevel: 5, desc: "提升战机最大血量。", canUpgrade, coins }),
      upgradeItem({ key: "hit", group: "命中技能", cost: 150 * (hitLevel + 1), level: hitLevel, maxLevel: 5, canUpgrade, coins, ...hit }),
      upgradeItem({ key: "kill", group: "击败技能", cost: fighter.key === "basic_fighter" ? 0 : 240, unlockOnly: true, level: killUnlocked ? 1 : 0, maxLevel: 1, done: killUnlocked, canUpgrade, coins, ...kill })
    ];
  }

  function hitMetric(title, base, step, level, maxValue, unit, desc) {
    const currentValue = base + step * level;
    const nextValue = base + step * (level + 1);
    const format = (value) => unit === "%" ? `${Math.round(value * 100)}%` : `${Math.round(value)}`;
    return { title, current: format(currentValue), next: format(nextValue), currentValue, nextValue, maxValue, desc };
  }

  function upgradeItem(item) {
    const done = item.done || item.level >= item.maxLevel;
    const disabled = done || !item.canUpgrade || (item.coins || 0) < item.cost;
    let buttonText = item.canUpgrade ? coinPriceText(item.cost) : "未解锁战机";
    if (done) buttonText = item.unlockOnly ? "已解锁" : "已满级";
    return { ...item, done, disabled, buttonText };
  }

  function coinPriceText(cost) {
    return `- <span class="coin-icon" aria-hidden="true"></span> ${cost}`;
  }

  function upgradeFighterItem(fighterId, itemKey) {
    const progress = readProgress();
    if (!isFighterOwned(progress, fighterId)) return;
    const fighter = fighterMap[fighterId];
    if (!fighter) return;
    const info = fighter.info || { stats: { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp } };
    const stats = info.stats || { damage: 1, fireRate: 1, bulletCount: 1, health: balance.heroBaseHp };
    const item = fighterUpgradeItems(fighter, stats, progress).find((entry) => entry.key === itemKey);
    if (!item || item.disabled || (progress.coins || 0) < item.cost) return;
    progress.coins -= item.cost;
    progress.fighterUpgrades = {
      ...(progress.fighterUpgrades || {}),
      [fighterId]: {
        ...normalizedFighterUpgrade(fighterId, progress)
      }
    };
    if (item.unlockOnly) {
      progress.fighterUpgrades[fighterId][itemKey] = true;
    } else {
      progress.fighterUpgrades[fighterId][itemKey] = (progress.fighterUpgrades[fighterId][itemKey] || 0) + 1;
    }
    writeProgress(progress);
    syncWalletFromProgress();
    if (fighterId === state.selectedFighterId) {
      const previousMaxHp = state.heroMaxHp;
      state.heroMaxHp = currentHeroMaxHp();
      state.heroHp = Math.min(state.heroMaxHp, state.heroHp + Math.max(0, state.heroMaxHp - previousMaxHp));
    }
    renderFighterUpgradePage();
    renderFighterInfoDialog();
    updateUi();
  }

  function resetCurrentFighterUpgrade() {
    const progress = readProgress();
    const fighter = fighters[state.fighterInfoIndex] || fighters[0];
    if (!isFighterOwned(progress, fighter.key)) return;
    progress.fighterUpgrades = {
      ...(progress.fighterUpgrades || {}),
      [fighter.key]: {
        damage: 0,
        fireRate: 0,
        bulletCount: 0,
        health: 0,
        hit: 0,
        kill: fighter.key === "basic_fighter"
      }
    };
    writeProgress(progress);
    syncWalletFromProgress();
    if (fighter.key === state.selectedFighterId) {
      state.heroMaxHp = currentHeroMaxHp();
      state.heroHp = Math.min(state.heroHp, state.heroMaxHp);
    }
    renderFighterUpgradePage();
    renderFighterInfoDialog();
    updateUi();
  }

  function purchaseFighter(fighterId) {
    const fighter = fighterMap[fighterId];
    if (!fighter) return;
    const progress = readProgress();
    if (isFighterOwned(progress, fighterId) || (progress.coins || 0) < fighter.cost) return;
    progress.coins -= fighter.cost;
    progress.fighters[fighterId] = { owned: true };
    writeProgress(progress);
    state.wallet = { coins: progress.coins || 0, drawTickets: progress.drawTickets || 0 };
    state.fighterPreviewIndex = fighterIndexById(fighterId);
    state.lastReward = `${fighter.name} 已解锁`;
    renderFighterDialog();
    updateUi();
  }

  function startSelectedFighter() {
    const fighter = previewFighter();
    const progress = readProgress();
    if (!isFighterOwned(progress, fighter.key)) {
      purchaseFighter(fighter.key);
      return;
    }
    saveSelectedFighter(fighter.key);
    state.fighterDialogInitial = false;
    state.paused = false;
    closeDialog(ui.fighterDialog);
    updateUi();
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(24, 64);
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, timeLeft: rand(0.18, 0.35), color });
    }
    if (state.particles.length > 36) state.particles.splice(0, state.particles.length - 36);
  }

  function updateParticles(delta) {
    for (const p of state.particles) {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.timeLeft -= delta;
    }
    state.particles = state.particles.filter((p) => p.timeLeft > 0);
  }

  function draw() {
    ctx.clearRect(0, 0, state.w, state.h);
    drawBackground();
    drawWorld();
    drawChest();
    drawAreaEffects();
    drawEnemies();
    drawProjectiles();
    drawHero();
    drawParticles();
  }

  function strokeRect(r, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  }

  function drawBackground() {
    if (!state.backgroundCache) {
      state.backgroundCache = document.createElement("canvas");
      state.backgroundCache.width = state.w;
      state.backgroundCache.height = state.h;
      const bg = state.backgroundCache.getContext("2d");
      drawStaticBackground(bg);
    }
    ctx.drawImage(state.backgroundCache, 0, 0);
  }

  function drawStaticBackground(targetCtx) {
    const horizon = state.h * 0.43;
    targetCtx.fillStyle = "#05030d";
    targetCtx.fillRect(0, 0, state.w, state.h);
    const sky = targetCtx.createLinearGradient(0, 0, 0, state.h);
    sky.addColorStop(0, "#0d0622");
    sky.addColorStop(0.46, "#05030d");
    sky.addColorStop(1, "#010108");
    targetCtx.fillStyle = sky;
    targetCtx.fillRect(0, 0, state.w, state.h);
    targetCtx.save();
    targetCtx.globalAlpha = 0.18;
    targetCtx.strokeStyle = "#1bf7ff";
    targetCtx.lineWidth = 1;
    const verticalStep = 54;
    for (let x = -state.w; x <= state.w * 2; x += verticalStep) {
      targetCtx.beginPath();
      targetCtx.moveTo(state.w / 2, horizon);
      targetCtx.lineTo(x, state.h);
      targetCtx.stroke();
    }
    for (let i = 0; i < 14; i += 1) {
      const t = i / 13;
      const y = horizon + Math.pow(t, 1.9) * (state.h - horizon);
      targetCtx.beginPath();
      targetCtx.moveTo(0, y);
      targetCtx.lineTo(state.w, y);
      targetCtx.stroke();
    }
    targetCtx.globalAlpha = 0.14;
    targetCtx.strokeStyle = "#ff2bd6";
    for (let x = 18; x < state.w; x += 86) {
      targetCtx.beginPath();
      targetCtx.moveTo(x, 0);
      targetCtx.lineTo(x + state.w * 0.12, horizon);
      targetCtx.stroke();
    }
    targetCtx.globalAlpha = 0.9;
    targetCtx.fillStyle = "rgba(255, 43, 214, 0.26)";
    targetCtx.fillRect(0, horizon - 2, state.w, 2);
    targetCtx.fillStyle = "rgba(33, 247, 255, 0.22)";
    targetCtx.fillRect(0, horizon + 3, state.w, 1);
    targetCtx.restore();
  }

  function drawWorld() {
    ctx.save();
    ctx.shadowColor = "#ff2bd6";
    ctx.shadowBlur = 6;
    strokeRect(state.play, "rgba(255, 46, 138, 0.86)", 2);
    ctx.restore();
    ctx.fillStyle = "rgba(33, 247, 255, 0.055)";
    ctx.fillRect(state.road.x, state.road.y, state.road.w, state.road.h);
    ctx.save();
    ctx.shadowColor = "#21f7ff";
    ctx.shadowBlur = 6;
    strokeRect(state.road, "rgba(33, 247, 255, 0.68)", 1);
    strokeRect(state.wall, "#21f7ff", 3);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#ff2bd6";
    ctx.lineWidth = 1;
    for (let y = state.road.y + 18; y < state.road.y + state.road.h; y += 24) {
      ctx.beginPath();
      ctx.moveTo(state.road.x + 4, y);
      ctx.lineTo(state.road.x + state.road.w - 4, y + 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHero() {
    const x = state.hero.x;
    const y = state.hero.y;
    const size = balance.heroSize;
    const fighter = currentFighter();
    drawFighterAura(x, y, size, fighter);
    const image = fighterGameImages.get(fighter.key);
    if (image && image.complete && image.naturalWidth > 0) {
      const imageSize = size * 1.72;
      ctx.drawImage(image, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize);
      return;
    }
    ctx.save();
    ctx.fillStyle = `${fighter.color}24`;
    ctx.strokeStyle = fighter.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.78);
    ctx.lineTo(x + size * 0.16, y - size * 0.26);
    ctx.lineTo(x + size * 0.54, y - size * 0.03);
    ctx.lineTo(x + size * 0.23, y + size * 0.14);
    ctx.lineTo(x + size * 0.34, y + size * 0.56);
    ctx.lineTo(x + size * 0.08, y + size * 0.36);
    ctx.lineTo(x, y + size * 0.62);
    ctx.lineTo(x - size * 0.08, y + size * 0.36);
    ctx.lineTo(x - size * 0.34, y + size * 0.56);
    ctx.lineTo(x - size * 0.23, y + size * 0.14);
    ctx.lineTo(x - size * 0.54, y - size * 0.03);
    ctx.lineTo(x - size * 0.16, y - size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(244, 253, 255, 0.68)";
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.28, size * 0.085, size * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.58);
    ctx.lineTo(x, y + size * 0.3);
    ctx.moveTo(x - size * 0.17, y + size * 0.2);
    ctx.lineTo(x + size * 0.17, y + size * 0.2);
    ctx.stroke();
    ctx.fillStyle = fighter.color;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12, y + size * 0.58);
    ctx.lineTo(x, y + size * 0.82);
    ctx.lineTo(x + size * 0.12, y + size * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFighterAura(x, y, size, fighter) {
    const t = state.elapsed;
    const radius = size * 0.74;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = fighter.color;
    ctx.fillStyle = fighter.color;
    ctx.globalAlpha = 0.72;
    if (fighter.key === "flame_fighter") {
      drawOrbitMarks(x, y, radius, t * 1.8, 5, (px, py, angle) => {
        ctx.beginPath();
        ctx.moveTo(px, py - 5);
        ctx.lineTo(px + Math.cos(angle) * 5, py + 6);
        ctx.lineTo(px - Math.sin(angle) * 4, py + 2);
        ctx.closePath();
        ctx.fill();
      });
    } else if (fighter.key === "frost_fighter") {
      drawOrbitMarks(x, y, radius, -t * 1.2, 6, (px, py) => {
        ctx.beginPath();
        ctx.moveTo(px, py - 5);
        ctx.lineTo(px + 4, py);
        ctx.lineTo(px, py + 5);
        ctx.lineTo(px - 4, py);
        ctx.closePath();
        ctx.stroke();
      });
    } else if (fighter.key === "blast_fighter") {
      for (let i = 0; i < 3; i += 1) {
        const start = t * 1.4 + i * 2.1;
        ctx.beginPath();
        ctx.arc(x, y, radius + i * 3, start, start + 0.72);
        ctx.stroke();
      }
    } else if (fighter.key === "storm_fighter") {
      drawOrbitMarks(x, y, radius, t * 2.2, 4, (px, py, angle) => {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(px - dy * 5, py + dx * 5);
        ctx.lineTo(px + dx * 5, py + dy * 5);
        ctx.lineTo(px + dy * 5, py - dx * 5);
        ctx.stroke();
      });
    } else if (fighter.key === "piercing_fighter") {
      drawOrbitMarks(x, y, radius, t * 1.3, 4, (px, py, angle) => {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.fillRect(-2, -8, 4, 16);
        ctx.restore();
      });
    } else if (fighter.key === "fission_fighter") {
      drawOrbitMarks(x, y, radius, t * 1.5, 5, (px, py) => {
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 0.34;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fighter.key === "gravity_fighter") {
      ctx.globalAlpha = 0.36;
      ctx.fillStyle = "#05030d";
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.86, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.72;
      ctx.beginPath();
      ctx.arc(x, y, radius, t * 1.8, t * 1.8 + Math.PI * 1.35);
      ctx.stroke();
    } else {
      ctx.globalAlpha = 0.42;
      ctx.setLineDash([7, 8]);
      ctx.beginPath();
      ctx.arc(x, y, radius, t, t + Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawOrbitMarks(x, y, radius, rotation, count, drawMark) {
    for (let i = 0; i < count; i += 1) {
      const angle = rotation + (Math.PI * 2 * i) / count;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      drawMark(px, py, angle);
    }
  }

  function drawProjectiles() {
    ctx.lineWidth = 2;
    for (const p of state.projectiles) {
      const fighter = fighterMap[p.fighterId] || currentFighter();
      if (p.kind === "split") {
        const angle = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.fillStyle = fighter.color;
        ctx.strokeStyle = "#d7ffdd";
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, -5);
        ctx.lineTo(-1, 0);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 0.34;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-18, 0);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      ctx.strokeStyle = fighter.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.028, p.y - p.vy * 0.028);
      ctx.stroke();
    }
  }

  function drawChest() {
    const b = chestBounds();
    const lidY = b.y + b.h * 0.2;
    const splitY = b.y + b.h * 0.48;
    const baseY = b.y + b.h * 0.88;
    drawChestHpBar(b);
    ctx.save();
    ctx.shadowColor = "rgba(255, 178, 56, 0.72)";
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3;
    const bodyFill = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    bodyFill.addColorStop(0, "rgba(255, 211, 102, 0.32)");
    bodyFill.addColorStop(0.52, "rgba(255, 122, 61, 0.24)");
    bodyFill.addColorStop(1, "rgba(92, 30, 20, 0.68)");
    ctx.strokeStyle = "#ffd166";
    ctx.fillStyle = bodyFill;
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.1, splitY);
    ctx.quadraticCurveTo(b.x + b.w * 0.18, lidY, b.x + b.w * 0.5, lidY);
    ctx.quadraticCurveTo(b.x + b.w * 0.82, lidY, b.x + b.w * 0.9, splitY);
    ctx.lineTo(b.x + b.w * 0.88, baseY);
    ctx.lineTo(b.x + b.w * 0.12, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 51, 93, 0.28)";
    ctx.fillRect(b.x + b.w * 0.13, splitY + b.h * 0.06, b.w * 0.74, b.h * 0.3);
    ctx.strokeStyle = "rgba(39, 246, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.1, splitY);
    ctx.lineTo(b.x + b.w * 0.9, splitY);
    ctx.moveTo(b.x + b.w * 0.15, baseY);
    ctx.lineTo(b.x + b.w * 0.85, baseY);
    ctx.moveTo(b.x + b.w * 0.5, lidY);
    ctx.lineTo(b.x + b.w * 0.5, baseY);
    ctx.moveTo(b.x + b.w * 0.28, splitY + 2);
    ctx.lineTo(b.x + b.w * 0.2, baseY - 2);
    ctx.moveTo(b.x + b.w * 0.72, splitY + 2);
    ctx.lineTo(b.x + b.w * 0.8, baseY - 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 209, 102, 0.95)";
    ctx.fillRect(b.x + b.w * 0.41, b.y + b.h * 0.52, b.w * 0.18, b.h * 0.19);
    ctx.strokeStyle = "rgba(6, 3, 16, 0.72)";
    ctx.strokeRect(b.x + b.w * 0.41, b.y + b.h * 0.52, b.w * 0.18, b.h * 0.19);
    ctx.beginPath();
    ctx.arc(b.x + b.w * 0.5, b.y + b.h * 0.61, b.w * 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.56)";
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.22, b.y + b.h * 0.38);
    ctx.quadraticCurveTo(b.x + b.w * 0.5, b.y + b.h * 0.26, b.x + b.w * 0.78, b.y + b.h * 0.38);
    ctx.lineTo(b.x + b.w * 0.7, b.y + b.h * 0.41);
    ctx.quadraticCurveTo(b.x + b.w * 0.5, b.y + b.h * 0.34, b.x + b.w * 0.3, b.y + b.h * 0.41);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawChestHpBar(b) {
    const maxHp = currentChestMaxHp();
    const ratio = maxHp > 0 ? clamp(state.chestHp / maxHp, 0, 1) : 0;
    const barW = b.w * 0.9;
    const barH = 9;
    const barX = b.x + (b.w - barW) / 2;
    const barY = b.y - 18;
    ctx.save();
    ctx.fillStyle = "rgba(255, 178, 56, 0.16)";
    ctx.strokeStyle = "rgba(255, 178, 56, 0.72)";
    ctx.lineWidth = 1;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeRect(barX, barY, barW, barH);
    const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fill.addColorStop(0, "#ff335d");
    fill.addColorStop(0.55, "#ffb238");
    fill.addColorStop(1, "#27f6ff");
    ctx.fillStyle = fill;
    ctx.fillRect(barX + 1, barY + 1, Math.max(0, (barW - 2) * ratio), barH - 2);
    ctx.restore();
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      const radius = enemyRadius(enemy);
      const color = enemy.phase === 0 ? "#ff335d" : enemy.phase === 1 ? "#ff7a3d" : enemy.phase === 3 ? "#e7f7ff" : "#b76cff";
      ctx.strokeStyle = color;
      ctx.fillStyle = enemy.phase === 3 ? "rgba(231, 247, 255, 0.13)" : enemy.phase === 2 ? "rgba(183, 108, 255, 0.12)" : "rgba(255, 51, 93, 0.1)";
      ctx.lineWidth = enemy.phase >= 2 ? 4 : 2;
      if (enemy.phase === 0) {
        ctx.strokeRect(enemy.x - radius, enemy.y - radius, radius * 2, radius * 2);
      } else {
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - radius);
        ctx.lineTo(enemy.x + radius, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + radius);
        ctx.lineTo(enemy.x - radius, enemy.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (enemy.phase >= 2) drawEnemyHp(enemy, radius, color);
      }
      if (enemy.burnTime > 0) {
        ctx.strokeStyle = "#ff7a3d";
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x - radius - 3, enemy.y - radius - 3, radius * 2 + 6, radius * 2 + 6);
      }
      if (enemy.slowTime > 0) {
        ctx.strokeStyle = "#7ddcff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function drawAreaEffects() {
    for (const effect of state.effects) {
      if (effect.type === "lightning") {
        ctx.globalAlpha = clamp(effect.timeLeft * 6, 0, 1);
        ctx.strokeStyle = "#b76cff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        const dx = effect.x2 - effect.x1;
        const dy = effect.y2 - effect.y1;
        const length = Math.max(1, Math.hypot(dx, dy));
        const nx = -dy / length;
        const ny = dx / length;
        for (let i = 1; i <= 4; i += 1) {
          const t = i / 5;
          const jitter = (i % 2 === 0 ? -1 : 1) * 7;
          ctx.lineTo(effect.x1 + dx * t + nx * jitter, effect.y1 + dy * t + ny * jitter);
        }
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
        ctx.globalAlpha *= 0.55;
        ctx.strokeStyle = "#f4fdff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }
      if (effect.type === "explosion") {
        const progress = 1 - effect.timeLeft / effect.duration;
        const radius = effect.radius * (0.28 + progress * 0.82);
        const alpha = clamp(effect.timeLeft / effect.duration, 0, 1);
        ctx.save();
        ctx.globalAlpha = alpha * 0.42;
        ctx.fillStyle = "#ffb238";
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius * 0.72, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "#fff0a8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#ff7a3d";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i += 1) {
          const angle = (Math.PI * 2 * i) / 8 + progress * 0.6;
          const inner = radius * 0.42;
          const outer = radius * 0.95;
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
          ctx.stroke();
        }
        ctx.restore();
        continue;
      }
      if (effect.type === "blackhole") {
        const alpha = clamp(effect.timeLeft / fighterEffects.gravity.duration, 0.18, 0.72);
        const pulse = 1 + Math.sin(effect.timeLeft * 12) * 0.08;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(7, 3, 18, 0.82)";
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.36 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8d5bff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.58 * pulse, effect.timeLeft * 2.4, effect.timeLeft * 2.4 + Math.PI * 1.55);
        ctx.stroke();
        ctx.strokeStyle = "rgba(33, 247, 255, 0.74)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius * 0.86, -effect.timeLeft * 2, -effect.timeLeft * 2 + Math.PI * 1.2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }
      if (effect.type !== "burn" && effect.type !== "ice") continue;
      const color = effect.type === "burn" ? "#ff7a3d" : "#7ddcff";
      ctx.globalAlpha = clamp(effect.timeLeft / (effect.type === "burn" ? fighterEffects.flame.areaDuration : fighterEffects.frost.shardDuration), 0.16, 0.44);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.88;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawEnemyHp(enemy, radius, color) {
    const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1);
    const width = enemy.phase >= 2 ? radius * 3.2 : radius * 2;
    ctx.fillStyle = "rgba(255, 51, 93, 0.22)";
    ctx.fillRect(enemy.x - width / 2, enemy.y - radius - 11, width, 4);
    ctx.fillStyle = color;
    ctx.fillRect(enemy.x - width / 2, enemy.y - radius - 11, width * hpRatio, 4);
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.globalAlpha = clamp(p.timeLeft * 3, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  function updateUi() {
    const enemyHp = state.enemies.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0);
    const fighter = currentFighter();
    ui.levelName.textContent = state.levelCfg.name;
    ui.waveInfo.textContent = state.phase === 3 ? "死神" : state.phase === 2 ? "BOSS" : `WAVE ${state.activeWave} / ${balance.totalWaves}`;
    ui.phaseInfo.textContent = phaseName();
    ui.heroInfo.textContent = `${fighter.shortName} Lv${state.heroLevel} HP ${Math.ceil(state.heroHp)}/${Math.ceil(state.heroMaxHp)} 弹${currentBulletCount()} 穿${currentPierce()}`;
    ui.killInfo.textContent = `击杀 ${state.killCount}`;
    ui.skillInfo.textContent = `经验 ${Math.floor(state.xp)} / ${state.xpNeed}`;
    ui.skillPoolInfo.textContent = `宝箱 ${Math.ceil(state.chestHp)} / ${Math.ceil(currentChestMaxHp())}`;
    ui.enemyHpInfo.textContent = `敌人 ${state.enemies.length}  HP ${Math.ceil(enemyHp)}`;
    ui.dropInfo.textContent = state.lastReward ? `奖励：${state.lastReward}｜金币 ${state.earnedGold}` : `金币 ${state.earnedGold}`;
    ui.economyInfo.textContent = `持有金币 ${state.wallet.coins}｜抽奖券 ${state.wallet.drawTickets}`;
    if (!ui.mainMenu.hidden) renderMainMenu();
  }

  function loop(time) {
    const now = time / 1000;
    const delta = state.lastTime ? Math.min(0.033, now - state.lastTime) : 0;
    state.lastTime = now;
    update(delta);
    draw();
    updateUi();
    requestAnimationFrame(loop);
  }

  function bindHold(button, key) {
    if (!button) return;
    const set = (value) => {
      state.input[key] = value;
      button.classList.toggle("is-held", value);
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      set(true);
    });
    button.addEventListener("pointerup", () => set(false));
    button.addEventListener("pointercancel", () => set(false));
    button.addEventListener("lostpointercapture", () => set(false));
  }

  function bindInput() {
    bindHold(ui.moveLeft, "left");
    bindHold(ui.moveRight, "right");
    bindFighterSwipe();
    bindFighterInfoSwipe();
    window.addEventListener("keydown", (event) => {
      if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") state.input.left = true;
      if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") state.input.right = true;
    });
    window.addEventListener("keyup", (event) => {
      if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") state.input.left = false;
      if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") state.input.right = false;
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (state.paused) return;
      state.input.pointer = true;
      moveHeroToPointer(event);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (state.input.pointer) moveHeroToPointer(event);
    });
    window.addEventListener("pointerup", () => {
      state.input.pointer = false;
    });
    ui.retryButton.addEventListener("click", () => initLevel(state.levelIndex));
    ui.resultHomeButton.addEventListener("click", () => {
      initLevel(state.levelIndex);
      openMainMenu();
    });
    ui.nextButton.addEventListener("click", () => initLevel(Math.min(state.levelIndex + 1, levelOrder.length - 1)));
    ui.mainStartButton.addEventListener("click", startFromMainMenu);
    ui.fighterInfoButton.addEventListener("click", openFighterInfoDialog);
    ui.fighterButton.addEventListener("click", () => openFighterDialog(false));
    ui.exitGameButton.addEventListener("click", openExitConfirm);
    ui.exitCancelButton.addEventListener("click", cancelExitConfirm);
    ui.exitConfirmButton.addEventListener("click", confirmExitGame);
    ui.drawFighterButton.addEventListener("click", openMainMenu);
    ui.fighterDialog.addEventListener("cancel", (event) => event.preventDefault());
    ui.exitDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      cancelExitConfirm();
    });
    ui.fighterPrevButton.addEventListener("click", () => moveFighterPreview(-1));
    ui.fighterNextButton.addEventListener("click", () => moveFighterPreview(1));
    ui.startFighterButton.addEventListener("click", startSelectedFighter);
    ui.fighterInfoPrevButton.addEventListener("click", () => moveFighterInfoPreview(-1));
    ui.fighterInfoNextButton.addEventListener("click", () => moveFighterInfoPreview(1));
    ui.fighterInfoCloseButton.addEventListener("click", openMainMenu);
    ui.fighterUpgradeButton.addEventListener("click", openFighterUpgradePage);
    ui.fighterUpgradeBackButton.addEventListener("click", openFighterInfoDialog);
    ui.fighterUpgradeResetButton.addEventListener("click", resetCurrentFighterUpgrade);
    window.addEventListener("resize", resize);
  }

  function bindFighterSwipe() {
    let startX = 0;
    let pointerId = null;
    ui.fighterTrack.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      startX = event.clientX;
      ui.fighterTrack.setPointerCapture(pointerId);
    });
    ui.fighterTrack.addEventListener("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      pointerId = null;
      if (Math.abs(deltaX) < 42) return;
      moveFighterPreview(deltaX < 0 ? 1 : -1);
    });
    ui.fighterTrack.addEventListener("pointercancel", () => {
      pointerId = null;
    });
  }

  function bindFighterInfoSwipe() {
    let startX = 0;
    let pointerId = null;
    ui.fighterInfoTrack.addEventListener("pointerdown", (event) => {
      pointerId = event.pointerId;
      startX = event.clientX;
      ui.fighterInfoTrack.setPointerCapture(pointerId);
    });
    ui.fighterInfoTrack.addEventListener("pointerup", (event) => {
      if (event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      pointerId = null;
      if (Math.abs(deltaX) < 42) return;
      moveFighterInfoPreview(deltaX < 0 ? 1 : -1);
    });
    ui.fighterInfoTrack.addEventListener("pointercancel", () => {
      pointerId = null;
    });
  }

  function moveHeroToPointer(event) {
    state.hero.x = clamp(event.clientX, state.play.x + 34, state.play.x + state.play.w - 34);
  }

  window.__neonTowerDebug = {
    rollChestChoiceCount,
    rollRarity: () => rollRarity().label,
    generateChoiceCards: () => generateChoiceCards(state),
    state
  };

  bindInput();
  resize();
  initLevel(1);
  openMainMenu();
  requestAnimationFrame(loop);
})();
