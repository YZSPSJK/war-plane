extends RefCounted
class_name GameBalance

static func world() -> Dictionary:
	return {
		"hero_size": Vector2(42, 42),
		"hero_speed": 330.0,
		"projectile_speed": 520.0,
		"projectile_radius": 7.0,
		"projectile_hit_radius": 11.0,
		"projectile_segment_length": 18.0,
		"projectile_arm_distance": 30.0,
		"shoot_interval": 0.35,
		"hero_base_attack": 1.0,
		"skill_pool_max_hp": 500.0,
		"damage_to_skill_pool": 10.0,
		"boss_control_reduction": 0.5
	}


static func enemy() -> Dictionary:
	return {
		"total_waves": 5,
		"wave_base_count": 10,
		"wave_count_step": 10,
		"wave_base_hp": 10.0,
		"wave_hp_step": 45.0,
		"wave_base_elite_hp": 70.0,
		"wave_elite_hp_step": 22.0,
		"boss_max_hp": 420.0,
		"swarm_fall_speed": 50.0,
		"elite_fall_speed": 50.0,
		"boss_fall_speed": 50.0,
		"swarm_hit_radius": 20.0,
		"swarm_spawn_interval": 0.55,
		"elite_spawn_interval": 0.85
	}


static func skill_runtime() -> Dictionary:
	return {
		"common_cd": 15.0,
		"base_damage_mult": 1.1,
		"tick_interval": 1.0
	}


static func progression() -> Dictionary:
	return {
		"kill_requirements": [6, 14, 24, 36, 50, 66, 84, 104, 126],
		"bullet_count_per_upgrade": 1,
		"bullet_speed_per_upgrade": 0.10,
		"bullet_damage_per_upgrade": 0.20
	}


static func skill_unlock_pool() -> Array[String]:
	return [
		"大手里剑",
		"苦无",
		"影分身",
		"火遁.豪火球",
		"火遁.凤仙花",
		"土遁.土流壁",
		"土遁·黄泉沼"
	]


static func skills() -> Dictionary:
	return {
		"大手里剑": {
			"base": {
				"radius_cells": 2.0,
				"linger_seconds": 1.0,
				"damage_mult": 1.1,
				"fly_speed_mult": 1.0
			},
			"upgrade": {
				"radius_cells_per_level": 1.0,
				"linger_percent_per_level": 0.5,
				"fly_speed_percent_per_level": 0.2
			}
		},
		"苦无": {
			"base": {
				"extra_pierce": 1,
				"damage_decay_ratio": 0.0,
				"poison_damage": 1.0,
				"poison_duration": 5.0,
				"poison_interval": 1.0
			},
			"upgrade": {
				"extra_pierce_per_level": 1,
				"poison_damage_per_level": 1.0,
				"poison_duration_per_level": 1.0,
				"crit_rate_per_level": 0.05,
				"crit_damage_per_level": 0.2
			}
		},
		"影分身": {
			"base": {
				"count": 1,
				"duration": 5.0,
				"inherit_attack_ratio": 1.0,
				"max_alive": 10
			},
			"upgrade": {
				"count_per_level": 1,
				"duration_per_level": 1.0,
				"inherit_attack_ratio_per_level": 0.1,
				"max_alive_per_level": 1
			}
		},
		"火遁.豪火球": {
			"base": {
				"direct_damage": 5.0,
				"explode_radius_cells": 2.0,
				"knockback_cells": 1.0,
				"chain_explode_count": 0,
				"fly_speed_mult": 1.0
			},
			"upgrade": {
				"direct_damage_per_level": 1.0,
				"explode_radius_cells_per_level": 1.0,
				"knockback_cells_per_level": 0.5,
				"chain_explode_count_per_level": 1,
				"fly_speed_percent_per_level": 0.2
			}
		},
		"火遁.凤仙花": {
			"base": {
				"count": 3,
				"hit_damage": 5.0,
				"burn_damage": 1.0,
				"burn_duration": 5.0,
				"burn_interval": 1.0,
				"burn_radius_cells": 2.0
			},
			"upgrade": {
				"count_per_level": 1,
				"burn_damage_per_level": 1.0,
				"burn_duration_per_level": 1.0,
				"burn_interval_reduce_per_level": 0.1,
				"scatter_angle_per_level": 5.0
			}
		},
		"土遁.土流壁": {
			"base": {
				"wall_hp": 50.0,
				"duration": 5.0,
				"slow_ratio": 0.0,
				"width_units": 2.0,
				"contact_dps": 8.0,
				"count": 1
			},
			"upgrade": {
				"wall_hp_per_level": 10.0,
				"duration_per_level": 1.0,
				"width_units_per_level": 0.5,
				"count_per_level": 1,
				"slow_ratio_per_level": 0.05
			}
		},
		"土遁·黄泉沼": {
			"base": {
				"radius_cells": 3.0,
				"duration": 5.0,
				"slow_ratio": 0.2,
				"armor_break_ratio": 0.2,
				"dot_damage": 0.0
			},
			"upgrade": {
				"radius_cells_per_level": 1.0,
				"duration_per_level": 1.0,
				"slow_ratio_per_level": 0.05,
				"armor_break_ratio_per_level": 0.05,
				"dot_damage_per_level": 1.0
			}
		}
	}
