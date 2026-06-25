(function () {
  const { balance, rarityDefs, upgradeOptions, fighters } = window.NeonConfig;

  function pickWeighted(items) {
    const total = items.reduce((sum, item) => sum + Math.max(0, item.weight || 0), 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= Math.max(0, item.weight || 0);
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  }

  function rollChestChoiceCount() {
    return pickWeighted(balance.chest.rewardCounts).count;
  }

  function rollRarity() {
    return pickWeighted(Object.values(rarityDefs));
  }

  function formatValue(def, value) {
    if (def.valueType === "percent") return `${Math.round(value * 100)}%`;
    return `${value}`;
  }

  function fighterBaseBulletCount(state) {
    const fighter = fighters.find((item) => item.key === state.selectedFighterId) || fighters[0];
    const stats = fighter.info && fighter.info.stats ? fighter.info.stats : { bulletCount: 1 };
    const upgrade = (state.fighterUpgrades && state.fighterUpgrades[fighter.key]) || {};
    return stats.bulletCount + (upgrade.bulletCount || 0);
  }

  function upgradeRemaining(def, state) {
    if (!def.stat) return Infinity;
    if (def.stat === "bulletCount") return Math.max(0, balance.upgradeCaps.bulletCount - fighterBaseBulletCount(state) - state.upgrades.bulletCount);
    if (def.stat === "pierce") return Math.max(0, balance.upgradeCaps.pierce - state.upgrades.pierce);
    return Infinity;
  }

  function buildCard(def, rarity, state) {
    const value = Math.min(def.values[rarity.key], upgradeRemaining(def, state));
    return {
      id: `${def.key}:${rarity.key}`,
      rarity,
      value,
      title: def.title,
      icon: def.icon,
      desc: def.desc.replace("{value}", formatValue(def, value)),
      apply: (targetState) => {
        if (def.effect === "heal") {
          targetState.heroHp = Math.min(targetState.heroMaxHp, targetState.heroHp + def.values[rarity.key]);
          return;
        }
        targetState.upgrades[def.stat] += Math.min(value, upgradeRemaining(def, targetState));
        if (def.damagePenalty) {
          targetState.upgrades.damagePenalty = (targetState.upgrades.damagePenalty || 0) + 1;
        }
      }
    };
  }

  function generateChoiceCards(state, kind = "gift") {
    const pool = upgradeOptions
      .filter((def) => !def.rewardKinds || def.rewardKinds.includes(kind))
      .filter((def) => upgradeRemaining(def, state) > 0);
    const picked = [];
    while (picked.length < 3 && pool.length) {
      const def = pickWeighted(pool);
      const rarity = rollRarity();
      picked.push(buildCard(def, rarity, state));
      pool.splice(pool.indexOf(def), 1);
    }
    return picked;
  }

  window.NeonRewards = {
    rollChestChoiceCount,
    rollRarity,
    generateChoiceCards
  };
})();
