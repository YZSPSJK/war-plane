(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const ui = {
    levelName: document.getElementById("levelName"),
    waveInfo: document.getElementById("waveInfo"),
    phaseInfo: document.getElementById("phaseInfo"),
    heroInfo: document.getElementById("heroInfo"),
    killInfo: document.getElementById("killInfo"),
    skillInfo: document.getElementById("skillInfo"),
    skillPoolInfo: document.getElementById("skillPoolInfo"),
    enemyHpInfo: document.getElementById("enemyHpInfo"),
    dropInfo: document.getElementById("dropInfo"),
    moveLeft: document.getElementById("moveLeft"),
    moveRight: document.getElementById("moveRight"),
    dialog: document.getElementById("resultDialog"),
    resultTitle: document.getElementById("resultTitle"),
    resultText: document.getElementById("resultText"),
    retryButton: document.getElementById("retryButton"),
    nextButton: document.getElementById("nextButton"),
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

  const { balance, levelOrder, levelConfigs } = window.NeonConfig;
  const { readProgress, writeProgress } = window.NeonProgress;
  const { rollChestChoiceCount, rollRarity, generateChoiceCards } = window.NeonRewards;

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
    input: { left: false, right: false, pointer: false },
    projectiles: [],
    enemies: [],
    particles: [],
    levelIndex: 1,
    levelId: "level1",
    levelCfg: levelConfigs.level1,
    chestHp: balance.chestMaxHp,
    upgrades: { bulletCount: 0, fireRate: 0, pierce: 0, damage: 0 },
    lastReward: "",
    killCount: 0,
    killsByPhase: [0, 0, 0],
    heroLevel: 1,
    xp: 0,
    xpNeed: balance.xpRequirements[0],
    nextLevelIndex: 0,
    earnedGold: 0,
    shootTimer: 0,
    nextWave: 1,
    activeWave: 1,
    phase: 0,
    phaseSpawnLeft: 0,
    phaseUnitHp: 1,
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
    configScale: { hp: 1, speed: 1, spawn: 1 }
  };

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

  function currentBulletCount() {
    return 1 + state.upgrades.bulletCount;
  }

  function currentBulletSpeed() {
    return balance.projectileSpeed;
  }

  function currentBulletDamage() {
    return balance.heroBaseAttack * (1 + state.upgrades.damage);
  }

  function currentPierce() {
    return state.upgrades.pierce;
  }

  function shootInterval() {
    return balance.shootInterval / (1 + state.upgrades.fireRate);
  }

  function phaseName() {
    if (state.phase === 0) return "普通敌人";
    if (state.phase === 1) return "精英怪";
    return "Boss";
  }

  function activeEnemyRadius() {
    if (state.phase === 0) return 10;
    if (state.phase === 1) return 13;
    return 28;
  }

  function enemyRadius(enemy) {
    if (enemy.phase === 0) return 10;
    if (enemy.phase === 1) return 13;
    return 28;
  }

  function resize() {
    state.dpr = 1;
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = state.w;
    canvas.height = state.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    layoutWorld();
  }

  function layoutWorld() {
    const topReserved = 86;
    const bottomReserved = 168;
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
    state.particles = [];
    state.chestHp = balance.chestMaxHp;
    state.upgrades = { bulletCount: 0, fireRate: 0, pierce: 0, damage: 0 };
    state.lastReward = "";
    state.killCount = 0;
    state.killsByPhase = [0, 0, 0];
    state.heroLevel = 1;
    state.xp = 0;
    state.nextLevelIndex = 0;
    state.xpNeed = balance.xpRequirements[0];
    state.earnedGold = 0;
    state.shootTimer = 0;
    state.nextWave = 1;
    state.activeWave = 1;
    state.phase = 0;
    state.phaseSpawnLeft = 0;
    state.phaseUnitHp = 1;
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
    writeProgress(readProgress());
    layoutWorld();
    startNextStage();
    closeDialog(ui.dialog);
    closeDialog(ui.choiceDialog);
    closeDialog(ui.giftDialog);
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
    const totalHp = (balance.waveBaseHp + (wave - 1) * balance.waveHpStep) * state.configScale.hp;
    startPhase(0, count, totalHp / count);
  }

  function startElite() {
    const count = 16;
    const totalHp = (balance.waveBaseEliteHp + (state.activeWave - 1) * balance.waveEliteHpStep) * state.configScale.hp;
    startPhase(1, count, totalHp / count);
  }

  function startBoss() {
    state.activeWave = balance.totalWaves;
    startPhase(2, 1, balance.bossMaxHp * state.configScale.hp);
  }

  function startPhase(phase, count, unitHp) {
    state.phase = phase;
    state.enemies = [];
    state.phaseSpawnLeft = count;
    state.phaseUnitHp = unitHp;
    state.phaseTimer = 0;
  }

  function spawnEnemy() {
    const radius = activeEnemyRadius();
    const isBoss = state.phase === 2;
    state.enemies.push({
      id: state.nextEnemyId++,
      x: isBoss ? state.enemyLane.x + state.enemyLane.w / 2 : rand(state.enemyLane.x + radius + 2, state.enemyLane.x + state.enemyLane.w - radius - 2),
      y: state.enemyLane.y + radius + 4,
      hp: state.phaseUnitHp,
      maxHp: state.phaseUnitHp,
      phase: state.phase
    });
  }

  function update(delta) {
    if (state.gameOver || state.victory || state.paused) return;
    state.elapsed += delta;
    updateHero(delta);
    updateShooting(delta);
    updateEnemySpawn(delta);
    updateProjectiles(delta);
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

  function spawnProjectile(x, y, vx, vy, damage, pierceLeft = 0) {
    state.projectiles.push({ x, y, vx, vy, damage, pierceLeft, travel: 0, hitIds: [] });
  }

  function updateProjectiles(delta) {
    const bounds = growRect(state.play, 100);
    const next = [];
    for (const p of state.projectiles) {
      const dx = p.vx * delta;
      const dy = p.vy * delta;
      p.x += dx;
      p.y += dy;
      p.travel += Math.hypot(dx, dy);
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
    state.chestHp = Math.max(0, state.chestHp - balance.damageToChest);
    burst(projectile.x, projectile.y, "#ffb238", 2);
    if (state.chestHp <= 0) {
      state.chestHp = balance.chestMaxHp;
      openGifts(rollChestChoiceCount());
    }
    return true;
  }

  function hitEnemySide(projectile) {
    const candidates = state.enemies.filter((enemy) => !projectile.hitIds.includes(enemy.id) && dist(projectile, enemy) <= balance.projectileHitRadius + enemyRadius(enemy));
    if (!candidates.length) return false;
    candidates.sort((a, b) => (a.x === b.x ? b.y - a.y : a.x - b.x));
    const target = candidates[0];
    projectile.hitIds.push(target.id);
    applyDamage(target.id, projectile.damage);
    if (projectile.pierceLeft > 0) {
      projectile.pierceLeft -= 1;
      return false;
    }
    return true;
  }

  function updateEnemySpawn(delta) {
    if (state.phaseSpawnLeft <= 0) return;
    state.phaseTimer += delta;
    const base = state.phase === 0 ? balance.swarmSpawnInterval : balance.eliteSpawnInterval;
    const interval = state.phase === 2 ? 0.1 : base / state.configScale.spawn;
    while (state.phaseTimer >= interval && state.phaseSpawnLeft > 0) {
      state.phaseTimer -= interval;
      spawnEnemy();
      state.phaseSpawnLeft -= 1;
    }
  }

  function updateEnemies(delta) {
    for (const enemy of state.enemies) {
      const baseSpeed = enemy.phase === 0 ? balance.swarmFallSpeed : enemy.phase === 1 ? balance.eliteFallSpeed : balance.bossFallSpeed;
      enemy.y += baseSpeed * state.configScale.speed * delta;
    }
  }

  function checkFail() {
    for (const enemy of state.enemies) {
      if (enemy.y + enemyRadius(enemy) >= state.hero.y || dist(enemy, state.hero) <= balance.heroSize / 2 + enemyRadius(enemy)) {
        triggerGameOver();
        return;
      }
    }
  }

  function checkStageAdvance() {
    if (state.phaseSpawnLeft > 0 || state.enemies.length > 0) return;
    if (state.phase === 0) startElite();
    else if (state.phase === 1) startNextStage();
    else triggerVictory();
  }

  function applyDamage(enemyId, damage) {
    const enemy = state.enemies.find((item) => item.id === enemyId);
    if (!enemy) return;
    enemy.hp -= damage;
    if (enemy.hp > 0) return;
    state.enemies = state.enemies.filter((item) => item.id !== enemyId);
    state.killCount += 1;
    state.killsByPhase[enemy.phase] += 1;
    state.earnedGold += balance.goldByPhase[enemy.phase];
    gainXp(balance.xpByPhase[enemy.phase]);
    burst(enemy.x, enemy.y, enemy.phase === 2 ? "#b76cff" : "#ff335d", 3);
  }

  function gainXp(amount) {
    state.xp += amount;
    while (state.nextLevelIndex < balance.xpRequirements.length && state.xp >= state.xpNeed) {
      state.xp -= state.xpNeed;
      state.heroLevel += 1;
      state.nextLevelIndex += 1;
      state.xpNeed = balance.xpRequirements[state.nextLevelIndex] || Math.round(state.xpNeed * 1.25);
      state.pendingLevelChoices += 1;
    }
    if (!state.paused && state.pendingLevelChoices > 0) openPendingLevelChoice();
  }

  function openGifts(count) {
    state.paused = true;
    state.gift = { active: true, total: count, remaining: count };
    renderGifts();
  }

  function renderGifts() {
    ui.giftSource.textContent = "宝箱已击碎";
    ui.giftTitle.textContent = "点击宝箱开启奖励";
    ui.giftCount.textContent = `${state.gift.total - state.gift.remaining + 1} / ${state.gift.total}`;
    ui.giftItems.innerHTML = "";
    renderCelebration();
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
    const fireworks = Array.from({ length: 10 }, (_, i) => `<i class="firework f${i + 1}"></i>`).join("");
    const eggs = Array.from({ length: 8 }, (_, i) => `<i class="egg e${i + 1}"></i>`).join("");
    const sparks = Array.from({ length: 16 }, (_, i) => `<i class="spark s${i + 1}"></i>`).join("");
    ui.celebrationLayer.innerHTML = `${fireworks}${eggs}${sparks}`;
  }

  function openPendingLevelChoice() {
    state.pendingLevelChoices -= 1;
    state.paused = true;
    openChoice("等级提升", "选择一个强化", "level");
  }

  function openChoice(source, title, kind) {
    state.paused = true;
    state.choice = { active: true, source, title, kind, cards: generateChoiceCards(state) };
    renderChoice();
  }

  function renderChoice() {
    ui.choiceSource.textContent = state.choice.source;
    ui.choiceTitle.textContent = state.choice.title;
    ui.choiceCount.textContent = "3 选 1";
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
    card.apply();
    state.lastReward = card.title;
    state.choice.active = false;
    closeDialog(ui.choiceDialog);
    if (state.gift.remaining > 0) {
      renderGifts();
      return;
    }
    state.gift.active = false;
    if (state.pendingLevelChoices > 0) {
      openPendingLevelChoice();
      return;
    }
    state.paused = false;
  }

  function settleGold(victory) {
    const progress = readProgress();
    const gain = state.earnedGold + (victory ? balance.clearGold : 0);
    progress.coins = Math.max(0, (progress.coins || 0) + gain);
    if (victory) progress.unlockedLevelIndex = Math.max(progress.unlockedLevelIndex || 0, Math.min(state.levelIndex + 1, levelOrder.length - 1));
    writeProgress(progress);
    return { gain, total: progress.coins };
  }

  function triggerGameOver() {
    state.gameOver = true;
    state.paused = true;
    state.projectiles = [];
    const gold = settleGold(false);
    showDialog("防线崩溃", `本局金币 +${gold.gain}，当前金币 ${gold.total}。`, false);
  }

  function triggerVictory() {
    state.victory = true;
    state.paused = true;
    state.projectiles = [];
    const gold = settleGold(true);
    showDialog("同步完成", `${state.levelCfg.name} 已清空。本局金币 +${gold.gain}，当前金币 ${gold.total}。`, true);
  }

  function showDialog(title, text, victory) {
    ui.resultTitle.textContent = title;
    ui.resultText.textContent = text;
    ui.nextButton.hidden = !victory;
    if (!ui.dialog.open) ui.dialog.showModal();
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(24, 64);
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, timeLeft: rand(0.18, 0.35), color });
    }
    if (state.particles.length > 60) state.particles.splice(0, state.particles.length - 60);
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
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, state.w, state.h);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#12334a";
    ctx.lineWidth = 1;
    const grid = 48;
    for (let x = 0; x < state.w; x += grid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.h);
      ctx.stroke();
    }
    for (let y = 0; y < state.h; y += grid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWorld() {
    strokeRect(state.play, "#ff335d", 2);
    ctx.fillStyle = "rgba(39, 246, 255, 0.035)";
    ctx.fillRect(state.road.x, state.road.y, state.road.w, state.road.h);
    strokeRect(state.road, "rgba(39, 246, 255, 0.55)", 1);
    strokeRect(state.wall, "#27f6ff", 3);
  }

  function drawHero() {
    const x = state.hero.x;
    const y = state.hero.y;
    const size = balance.heroSize;
    ctx.strokeStyle = "#27f6ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.lineTo(x + size * 0.45, y - size * 0.05);
    ctx.lineTo(x + size * 0.28, y + size * 0.48);
    ctx.lineTo(x - size * 0.28, y + size * 0.48);
    ctx.lineTo(x - size * 0.45, y - size * 0.05);
    ctx.closePath();
    ctx.stroke();
  }

  function drawProjectiles() {
    ctx.strokeStyle = "#27f6ff";
    ctx.lineWidth = 2;
    for (const p of state.projectiles) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.028, p.y - p.vy * 0.028);
      ctx.stroke();
    }
  }

  function drawChest() {
    const b = chestBounds();
    ctx.strokeStyle = "#ffb238";
    ctx.fillStyle = "rgba(255, 178, 56, 0.10)";
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x, b.y + b.h * 0.18, b.w, b.h * 0.72);
    ctx.fillRect(b.x, b.y + b.h * 0.18, b.w, b.h * 0.72);
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.18, b.y + b.h * 0.18);
    ctx.lineTo(b.x + b.w * 0.34, b.y);
    ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.18);
    ctx.lineTo(b.x + b.w * 0.66, b.y);
    ctx.lineTo(b.x + b.w * 0.82, b.y + b.h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.5, b.y + b.h * 0.2);
    ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.9);
    ctx.moveTo(b.x, b.y + b.h * 0.48);
    ctx.lineTo(b.x + b.w, b.y + b.h * 0.48);
    ctx.stroke();
    ctx.fillStyle = "#ffb238";
    ctx.font = "700 20px Trebuchet MS, Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.ceil(state.chestHp)}`, b.x + b.w / 2, b.y + b.h + 24);
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      const radius = enemyRadius(enemy);
      const color = enemy.phase === 0 ? "#ff335d" : enemy.phase === 1 ? "#ff7a3d" : "#b76cff";
      ctx.strokeStyle = color;
      ctx.fillStyle = enemy.phase === 2 ? "rgba(183, 108, 255, 0.12)" : "rgba(255, 51, 93, 0.1)";
      ctx.lineWidth = enemy.phase === 2 ? 4 : 2;
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
        drawEnemyHp(enemy, radius, color);
      }
    }
  }

  function drawEnemyHp(enemy, radius, color) {
    const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1);
    const width = enemy.phase === 2 ? radius * 3.2 : radius * 2;
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
    ui.levelName.textContent = state.levelCfg.name;
    ui.waveInfo.textContent = state.phase === 2 ? "BOSS" : `WAVE ${state.activeWave} / ${balance.totalWaves}`;
    ui.phaseInfo.textContent = phaseName();
    ui.heroInfo.textContent = `Lv${state.heroLevel} 弹${currentBulletCount()} 穿${currentPierce()}`;
    ui.killInfo.textContent = `击杀 ${state.killCount}`;
    ui.skillInfo.textContent = `经验 ${Math.floor(state.xp)} / ${state.xpNeed}`;
    ui.skillPoolInfo.textContent = `宝箱 ${Math.ceil(state.chestHp)}`;
    ui.enemyHpInfo.textContent = `敌人 ${state.enemies.length}  HP ${Math.ceil(enemyHp)}`;
    ui.dropInfo.textContent = state.lastReward ? `奖励：${state.lastReward}｜金币 ${state.earnedGold}` : `金币 ${state.earnedGold}`;
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
    ui.nextButton.addEventListener("click", () => initLevel(Math.min(state.levelIndex + 1, levelOrder.length - 1)));
    window.addEventListener("resize", resize);
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
  requestAnimationFrame(loop);
})();
