(function () {
  window.NeonConfig = {
    balance: {
      heroSize: 42,
      heroSpeed: 330,
      projectileSpeed: 520,
      projectileHitRadius: 11,
      projectileArmDistance: 30,
      shootInterval: 0.35,
      heroBaseAttack: 1,
      chestMaxHp: 120,
      damageToChest: 3,
      totalWaves: 5,
      waveBaseCount: 10,
      waveCountStep: 10,
      waveBaseHp: 10,
      waveHpStep: 45,
      waveBaseEliteHp: 70,
      waveEliteHpStep: 22,
      bossMaxHp: 560,
      swarmFallSpeed: 50,
      eliteFallSpeed: 50,
      bossFallSpeed: 38,
      swarmSpawnInterval: 0.55,
      eliteSpawnInterval: 0.85,
      xpByPhase: [1, 6, 40],
      goldByPhase: [1, 6, 45],
      clearGold: 60,
      xpRequirements: [8, 18, 32, 50, 72, 98, 128, 162, 200]
    },
    levelOrder: ["level2_experience", "level1", "level3", "level4", "level5", "endless"],
    levelConfigs: {
      level2_experience: { name: "体验关", hp: 0.95, speed: 0.96, spawn: 1.03 },
      level1: { name: "第一关", hp: 1, speed: 1, spawn: 1 },
      level3: { name: "第三关", hp: 1.08, speed: 1.04, spawn: 1.03 },
      level4: { name: "第四关", hp: 1.14, speed: 1.06, spawn: 1.04 },
      level5: { name: "第五关", hp: 1.2, speed: 1.08, spawn: 1.05 },
      endless: { name: "无尽", hp: 1.32, speed: 1.14, spawn: 1.08 }
    },
    rarityDefs: {
      common: { label: "普通", css: "common", weight: 0.7, power: 1 },
      rare: { label: "稀有", css: "rare", weight: 0.25, power: 1.8 },
      legendary: { label: "传说", css: "legendary", weight: 0.05, power: 3 }
    }
  };
})();
