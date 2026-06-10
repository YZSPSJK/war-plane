extends RefCounted
class_name LevelCatalog

const LEVEL_ORDER: Array[String] = [
	"level2_experience",
	"level1",
	"level3",
	"level4",
	"level5",
	"endless"
]

const FIRST_FIVE_LEVELS: Array[String] = [
	"level2_experience",
	"level1",
	"level3",
	"level4",
	"level5"
]

const DEFAULT_LEVEL_CONFIG := {
	"unlock_focus": false,
	"unlock_target_count_min": 0,
	"unlock_target_count_max": 0,
	"unlock_gate_mode": "none",
	"unlock_opportunity_count": 0,
	"difficulty_band": {
		"pressure_min": 700.0,
		"pressure_max": 1150.0,
		"hp_scale": 1.0,
		"speed_scale": 1.0,
		"spawn_scale": 1.0
	},
	"assist_rules": {
		"enabled": false,
		"fail_threshold": 2,
		"max_steps": 2,
		"hp_reduce_per_step": 0.08,
		"speed_reduce_per_step": 0.05,
		"spawn_relax_per_step": 0.08
	}
}

const LEVEL_CONFIGS := {
	"level2_experience": {
		"unlock_focus": true,
		"unlock_target_count_min": 2,
		"unlock_target_count_max": 2,
		"unlock_gate_mode": "sequential",
		"unlock_opportunity_count": 18,
		"difficulty_band": {
			"pressure_min": 780.0,
			"pressure_max": 1080.0,
			"hp_scale": 0.95,
			"speed_scale": 0.96,
			"spawn_scale": 1.03
		},
		"assist_rules": {
			"enabled": true,
			"fail_threshold": 2,
			"max_steps": 2,
			"hp_reduce_per_step": 0.06,
			"speed_reduce_per_step": 0.04,
			"spawn_relax_per_step": 0.06
		}
	},
	"level1": {
		"unlock_focus": true,
		"unlock_target_count_min": 1,
		"unlock_target_count_max": 2,
		"unlock_gate_mode": "sequential",
		"unlock_opportunity_count": 14,
		"difficulty_band": {
			"pressure_min": 820.0,
			"pressure_max": 1120.0,
			"hp_scale": 1.0,
			"speed_scale": 1.0,
			"spawn_scale": 1.0
		},
		"assist_rules": {
			"enabled": true,
			"fail_threshold": 2,
			"max_steps": 2,
			"hp_reduce_per_step": 0.06,
			"speed_reduce_per_step": 0.04,
			"spawn_relax_per_step": 0.06
		}
	},
	"level3": {
		"unlock_focus": true,
		"unlock_target_count_min": 1,
		"unlock_target_count_max": 2,
		"unlock_gate_mode": "sequential",
		"unlock_opportunity_count": 16,
		"difficulty_band": {
			"pressure_min": 900.0,
			"pressure_max": 1240.0,
			"hp_scale": 1.08,
			"speed_scale": 1.04,
			"spawn_scale": 1.03
		},
		"assist_rules": {
			"enabled": true,
			"fail_threshold": 2,
			"max_steps": 2,
			"hp_reduce_per_step": 0.06,
			"speed_reduce_per_step": 0.04,
			"spawn_relax_per_step": 0.06
		}
	},
	"level4": {
		"unlock_focus": true,
		"unlock_target_count_min": 1,
		"unlock_target_count_max": 2,
		"unlock_gate_mode": "sequential",
		"unlock_opportunity_count": 16,
		"difficulty_band": {
			"pressure_min": 980.0,
			"pressure_max": 1300.0,
			"hp_scale": 1.14,
			"speed_scale": 1.06,
			"spawn_scale": 1.04
		},
		"assist_rules": {
			"enabled": true,
			"fail_threshold": 2,
			"max_steps": 2,
			"hp_reduce_per_step": 0.06,
			"speed_reduce_per_step": 0.04,
			"spawn_relax_per_step": 0.06
		}
	},
	"level5": {
		"unlock_focus": true,
		"unlock_target_count_min": 1,
		"unlock_target_count_max": 2,
		"unlock_gate_mode": "sequential",
		"unlock_opportunity_count": 16,
		"difficulty_band": {
			"pressure_min": 1060.0,
			"pressure_max": 1380.0,
			"hp_scale": 1.2,
			"speed_scale": 1.08,
			"spawn_scale": 1.05
		},
		"assist_rules": {
			"enabled": true,
			"fail_threshold": 2,
			"max_steps": 2,
			"hp_reduce_per_step": 0.06,
			"speed_reduce_per_step": 0.04,
			"spawn_relax_per_step": 0.06
		}
	},
	"endless": {
		"unlock_focus": false,
		"unlock_target_count_min": 0,
		"unlock_target_count_max": 0,
		"unlock_gate_mode": "none",
		"unlock_opportunity_count": 0,
		"difficulty_band": {
			"pressure_min": 1320.0,
			"pressure_max": 1800.0,
			"hp_scale": 1.32,
			"speed_scale": 1.14,
			"spawn_scale": 1.08
		},
		"assist_rules": {
			"enabled": false,
			"fail_threshold": 3,
			"max_steps": 1,
			"hp_reduce_per_step": 0.04,
			"speed_reduce_per_step": 0.02,
			"spawn_relax_per_step": 0.04
		}
	}
}


static func level_order() -> Array[String]:
	return LEVEL_ORDER.duplicate()


static func is_unlock_focus_level(level_id: String) -> bool:
	return FIRST_FIVE_LEVELS.has(level_id)


static func get_level_config(level_id: String) -> Dictionary:
	var cfg: Dictionary = LEVEL_CONFIGS.get(level_id, {}) as Dictionary
	var merged: Dictionary = DEFAULT_LEVEL_CONFIG.duplicate(true)
	for key in cfg.keys():
		var value: Variant = cfg[key]
		if value is Dictionary and merged.get(key, null) is Dictionary:
			var inner: Dictionary = merged[key]
			var value_dict: Dictionary = value
			for inner_key in value_dict.keys():
				inner[inner_key] = value_dict[inner_key]
			merged[key] = inner
		else:
			merged[key] = value
	return merged
