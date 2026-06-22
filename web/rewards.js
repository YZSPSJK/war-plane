(function () {
  const { rarityDefs } = window.NeonConfig;

  function rollChestChoiceCount() {
    const r = Math.random();
    if (r < 0.8) return 1;
    if (r < 0.95) return 3;
    return 5;
  }

  function rollRarity() {
    const r = Math.random();
    if (r < rarityDefs.common.weight) return rarityDefs.common;
    if (r < rarityDefs.common.weight + rarityDefs.rare.weight) return rarityDefs.rare;
    return rarityDefs.legendary;
  }

  const upgradeDefs = [
    {
      key: "bulletCount",
      title: "子弹数量",
      icon: "icon-bullet-count",
      desc: (r) => `基础子弹数量 +${Math.ceil(r.power)}。`,
      apply: (state, r) => { state.upgrades.bulletCount += Math.ceil(r.power); }
    },
    {
      key: "fireRate",
      title: "子弹射速",
      icon: "icon-fire-rate",
      desc: (r) => `射击频率 +${Math.round(10 * r.power)}%。`,
      apply: (state, r) => { state.upgrades.fireRate += 0.1 * r.power; }
    },
    {
      key: "pierce",
      title: "子弹穿透",
      icon: "icon-pierce",
      desc: (r) => `每发子弹穿透 +${Math.ceil(r.power)}。`,
      apply: (state, r) => { state.upgrades.pierce += Math.ceil(r.power); }
    },
    {
      key: "damage",
      title: "子弹伤害",
      icon: "icon-damage",
      desc: (r) => `子弹伤害 +${Math.round(18 * r.power)}%。`,
      apply: (state, r) => { state.upgrades.damage += 0.18 * r.power; }
    }
  ];

  function generateChoiceCards(state) {
    const pool = upgradeDefs.map((def) => {
      const rarity = rollRarity();
      return {
        id: `${def.key}:${rarity.label}`,
        rarity,
        title: def.title,
        icon: def.icon,
        desc: def.desc(rarity),
        apply: () => def.apply(state, rarity)
      };
    });
    const picked = [];
    while (picked.length < 3 && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  window.NeonRewards = {
    rollChestChoiceCount,
    rollRarity,
    generateChoiceCards
  };
})();
