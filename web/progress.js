(function () {
  function defaultProgress() {
    return {
      coins: 999999,
      drawTickets: 0,
      unlockedLevelIndex: 0,
      selectedCharacter: "neon_vanguard",
      selectedFighter: "basic_fighter",
      characters: {
        neon_vanguard: { owned: true, level: 1, shards: 0 }
      },
      fighters: {
        basic_fighter: { owned: true },
        flame_fighter: { owned: false },
        frost_fighter: { owned: false },
        blast_fighter: { owned: false },
        storm_fighter: { owned: false },
        piercing_fighter: { owned: false },
        fission_fighter: { owned: false },
        gravity_fighter: { owned: false }
      },
      fighterUpgrades: {
        basic_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: true },
        flame_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        frost_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        blast_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        storm_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        piercing_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        fission_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false },
        gravity_fighter: { damage: 0, fireRate: 0, bulletCount: 0, health: 0, hit: 0, kill: false }
      }
    };
  }

  function readProgress() {
    let raw = {};
    try {
      raw = JSON.parse(localStorage.getItem("neonTowerProgress") || "{}");
    } catch (_err) {
      raw = {};
    }
    const base = defaultProgress();
    return {
      ...base,
      ...raw,
      characters: {
        ...base.characters,
        ...(raw.characters || {})
      },
      fighters: {
        ...base.fighters,
        ...(raw.fighters || {}),
        basic_fighter: { owned: true }
      },
      fighterUpgrades: {
        ...base.fighterUpgrades,
        ...(raw.fighterUpgrades || {}),
        basic_fighter: {
          ...base.fighterUpgrades.basic_fighter,
          ...((raw.fighterUpgrades || {}).basic_fighter || {}),
          kill: true
        }
      }
    };
  }

  function writeProgress(progress) {
    localStorage.setItem("neonTowerProgress", JSON.stringify(progress));
  }

  window.NeonProgress = {
    readProgress,
    writeProgress
  };
})();
