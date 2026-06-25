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
      heroBaseHp: 100,
      heroHpUpgradeStep: 20,
      enemyDamage: {
        swarm: 5,
        elite: 10
      },
      chest: {
        maxHp: 120,
        hpGrowthMultiplier: 1.5,
        hpRoundStep: 100,
        damagePerHit: 3,
        rewardCounts: [
          { count: 1, weight: 0.8 },
          { count: 3, weight: 0.15 },
          { count: 5, weight: 0.05 }
        ]
      },
      totalWaves: 5,
      waveBaseCount: 7,
      waveCountStep: 5,
      swarmHp: 4,
      eliteHp: 8,
      enemyHpPressure: {
        triggerSeconds: 5,
        growthMultiplier: 1.5
      },
      bossMaxHp: 560,
      swarmFallSpeed: 7.5,
      eliteFallSpeed: 7.5,
      bossFallSpeed: 5.7,
      swarmSpawnInterval: 0.72,
      eliteSpawnInterval: 1.05,
      eliteCount: 8,
      xpByPhase: [1, 6, 40],
      goldByPhase: [1, 6, 45],
      clearGold: 60,
      clearTickets: 1,
      progression: {
        xpRequirements: [16, 34, 58, 88, 124, 166, 214, 268, 328]
      },
      upgradeCaps: {
        bulletCount: 5,
        pierce: 3
      },
      deathBoss: {
        enabled: true,
        name: "死神Boss",
        spawnAfterSeconds: 300,
        hp: 2200,
        fallSpeed: 5.1,
        xp: 120,
        gold: 220
      }
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
    fighters: [
      {
        key: "basic_fighter",
        name: "基础战机",
        shortName: "基础",
        color: "#27f6ff",
        cost: 0,
        selectImage: "assets/warPlane/普通战机.png",
        gameImage: "assets/warPlane/基础战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1.1, bulletCount: 1, health: 100 },
          hitSkill: "基础伤害，攻击速度 +10%。",
          hitUpgrade: "命中升级：继续提升基础射速。",
          killSkill: "击败被动：基础战机无额外击败被动。"
        },
        desc: "没有额外加成。"
      },
      {
        key: "flame_fighter",
        name: "火焰战机",
        shortName: "火焰",
        color: "#ff7a3d",
        cost: 180,
        selectImage: "assets/warPlane/火焰战机.png",
        gameImage: "assets/warPlane/火焰战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：造成持续伤害。",
          hitUpgrade: "命中升级：提升持续伤害数值。",
          killSkill: "击败被动：生成 2 秒灼烧区域。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "命中敌人附加持续伤害，击败敌人留下 3 秒灼烧区域。"
      },
      {
        key: "frost_fighter",
        name: "冰霜战机",
        shortName: "冰霜",
        color: "#7ddcff",
        cost: 180,
        selectImage: "assets/warPlane/冰霜战机.png",
        gameImage: "assets/warPlane/冰霜战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：造成减速。",
          hitUpgrade: "命中升级：提升减速数值。",
          killSkill: "击败被动：产生减速区域。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "命中敌人减速，击败敌人产生有伤害的减速冰片。"
      },
      {
        key: "blast_fighter",
        name: "爆炸战机",
        shortName: "爆炸",
        color: "#ffb238",
        cost: 220,
        selectImage: "assets/warPlane/爆破战机.png",
        gameImage: "assets/warPlane/爆破战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：造成范围伤害。",
          hitUpgrade: "命中升级：提升范围伤害。",
          killSkill: "击败被动：产生一次范围爆炸。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "命中敌人产生范围伤害。"
      },
      {
        key: "storm_fighter",
        name: "闪电战机",
        shortName: "闪电",
        color: "#b76cff",
        cost: 240,
        selectImage: "assets/warPlane/闪电战机.png",
        gameImage: "assets/warPlane/闪电战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：产生闪电链。",
          hitUpgrade: "命中升级：提升闪电链伤害。",
          killSkill: "击败被动：施放一次过载闪电，命中最近的一个敌人。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "命中敌人产生闪电链，闪电链伤害不会继续触发新的闪电链。"
      },
      {
        key: "piercing_fighter",
        name: "穿甲战机",
        shortName: "穿甲",
        color: "#f4fdff",
        cost: 240,
        selectImage: "assets/warPlane/穿甲战机.png",
        gameImage: "assets/warPlane/穿甲战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：增加攻速；切换目标时重置攻速。",
          hitUpgrade: "命中升级：提升攻速提升数值。",
          killSkill: "击败被动：保留攻速加成。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "连续命中同一敌人时，射击速度逐步提高。"
      },
      {
        key: "fission_fighter",
        name: "裂变战机",
        shortName: "裂变",
        color: "#6dff7d",
        cost: 260,
        selectImage: "assets/warPlane/裂变战机.png",
        gameImage: "assets/warPlane/裂变战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：产生一颗 50% 伤害的分裂子弹。",
          hitUpgrade: "命中升级：提升分裂子弹伤害。",
          killSkill: "击败被动：产生两颗分裂子弹。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "命中敌人后向周围敌人飞出分裂子弹。"
      },
      {
        key: "gravity_fighter",
        name: "引力战机",
        shortName: "引力",
        color: "#8d5bff",
        cost: 280,
        selectImage: "assets/warPlane/引力战机.png",
        gameImage: "assets/warPlane/引力战机_s.png",
        info: {
          stats: { damage: 1, fireRate: 1, bulletCount: 1, health: 100 },
          hitSkill: "命中：产生击退。",
          hitUpgrade: "命中升级：提升击退距离。",
          killSkill: "击败被动：产生黑洞，将范围内敌人缓慢拉向中心，持续 2 秒。",
          killUnlock: "需金币解锁击败被动。"
        },
        desc: "击败敌人后生成黑洞，将周围敌人拉向中心。"
      }
    ],
    fighterEffects: {
      flame: { burnDuration: 2.4, burnTick: 0.4, burnDamage: 0.32, areaDuration: 3, areaRadius: 42 },
      frost: { slowDuration: 1.6, slowFactor: 0.55, shardDuration: 2.4, shardRadius: 46, shardTick: 0.5, shardDamage: 0.35 },
      blast: { radius: 48, damage: 0.55 },
      storm: { jumps: 3, radius: 96, damage: 0.55, falloff: 0.72 },
      piercing: { fireRateStep: 0.18, maxFireRateBonus: 1.2 },
      fission: { radius: 86, targets: 3, damage: 0.45 },
      gravity: { duration: 2.8, radius: 92, pullSpeed: 92, knockbackScale: 0.08 }
    },
    rarityDefs: {
      common: { key: "common", label: "普通", css: "common", weight: 0.7 },
      rare: { key: "rare", label: "史诗", css: "rare", weight: 0.25 },
      legendary: { key: "legendary", label: "传说", css: "legendary", weight: 0.05 }
    },
    upgradeOptions: [
      {
        key: "bulletCount",
        stat: "bulletCount",
        title: "子弹数量",
        icon: "icon-bullet-count",
        weight: 1,
        rewardKinds: ["gift"],
        valueType: "number",
        values: { common: 1, rare: 1, legendary: 1 },
        damagePenalty: 0.25,
        desc: "子弹数 +1，伤害降低25%。"
      },
      {
        key: "fireRate",
        stat: "fireRate",
        title: "子弹射速",
        icon: "icon-fire-rate",
        weight: 1,
        valueType: "percent",
        values: { common: 0.1, rare: 0.18, legendary: 0.3 },
        desc: "射击频率 +{value}。"
      },
      {
        key: "pierce",
        stat: "pierce",
        title: "子弹穿透",
        icon: "icon-pierce",
        weight: 1,
        rewardKinds: ["gift"],
        valueType: "number",
        values: { common: 1, rare: 1, legendary: 1 },
        desc: "每发子弹穿透 +{value}。"
      },
      {
        key: "damage",
        stat: "damage",
        title: "子弹伤害",
        icon: "icon-damage",
        weight: 1,
        valueType: "percent",
        values: { common: 0.18, rare: 0.32, legendary: 0.54 },
        desc: "子弹伤害 +{value}。"
      },
      {
        key: "heal",
        effect: "heal",
        title: "血量恢复",
        icon: "icon-heal",
        weight: 1,
        valueType: "number",
        values: { common: 5, rare: 15, legendary: 30 },
        desc: "立即恢复 {value} 点战机血量。"
      }
    ]
  };
})();
