(function () {
  function defaultProgress() {
    return {
      coins: 0,
      unlockedLevelIndex: 0,
      selectedCharacter: "neon_vanguard",
      characters: {
        neon_vanguard: { owned: true, level: 1, shards: 0 }
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
