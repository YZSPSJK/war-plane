extends Node2D

const GameBalance = preload("res://scripts/config/game_balance.gd")
const LevelCatalog = preload("res://scripts/config/level_catalog.gd")
const LevelProgress = preload("res://scripts/core/level_progress.gd")
const HERO_FRAME_SOURCES := [
	Rect2(89, 227, 313, 614),
	Rect2(514, 227, 313, 614),
	Rect2(926, 227, 313, 614)
]
const HERO_FRAME_COUNT := 3
const HERO_ANIM_FPS := 10.0
const PIXEL_ASSET_PATHS := {
	"basic_bolt": "res://assets/pixel_skills/basic_bolt.png",
	"burn_patch": "res://assets/pixel_skills/burn_patch.png",
	"chakra_orb": "res://assets/pixel_skills/chakra_orb.png",
	"earth_wall": "res://assets/pixel_skills/earth_wall.png",
	"enemy_boss": "res://assets/pixel_skills/enemy_boss.png",
	"enemy_elite": "res://assets/pixel_skills/enemy_elite.png",
	"enemy_imp": "res://assets/pixel_skills/enemy_imp.png",
	"fireball": "res://assets/pixel_skills/fireball.png",
	"kunai": "res://assets/pixel_skills/kunai.png",
	"phoenix_ember": "res://assets/pixel_skills/phoenix_ember.png",
	"shuriken": "res://assets/pixel_skills/shuriken.png",
	"spent_orb": "res://assets/pixel_skills/spent_orb.png",
	"swamp_pool": "res://assets/pixel_skills/swamp_pool.png"
}

@onready var top_info: Label = $UI/Root/TopPanel/TopInfo
@onready var swarm_hp_label: Label = $UI/Root/SwarmHpLabel
@onready var skill_pool_hp_label: Label = $UI/Root/SkillPoolHpLabel
@onready var skill_drop_label: Label = $UI/Root/SkillDropLabel
@onready var game_over_popup: Panel = $UI/Root/GameOverPopup
@onready var victory_popup: Panel = $UI/Root/VictoryPopup
@onready var restart_button: Button = $UI/Root/GameOverPopup/VBox/RestartButton
@onready var select_level_on_fail_button: Button = $UI/Root/GameOverPopup/VBox/SelectLevelOnFailButton
@onready var next_level_button: Button = $UI/Root/VictoryPopup/VBox/NextLevelButton
@onready var select_level_button: Button = $UI/Root/VictoryPopup/VBox/SelectLevelButton
@onready var move_left_btn: Button = $UI/Root/MovePanel/MoveLeft
@onready var move_right_btn: Button = $UI/Root/MovePanel/MoveRight

@export var level_id := "level1"
@export var next_level_scene_path := ""

var HERO_SIZE := Vector2(42, 42)
var HERO_SPEED := 330.0
var PROJECTILE_SPEED := 520.0
var PROJECTILE_RADIUS := 7.0
var PROJECTILE_HIT_RADIUS := 11.0
var PROJECTILE_SEGMENT_LENGTH := 18.0
var PROJECTILE_ARM_DISTANCE := 30.0
var SHOOT_INTERVAL := 0.35
var HERO_BASE_ATTACK := 1.0

var TOTAL_WAVES := 5
var WAVE_BASE_COUNT := 10
var WAVE_COUNT_STEP := 10
var WAVE_BASE_HP := 90.0
var WAVE_HP_STEP := 45.0
var WAVE_BASE_ELITE_HP := 70.0
var WAVE_ELITE_HP_STEP := 22.0
var BOSS_MAX_HP := 420.0

const SKILL_GRID_COLS := 10
const SKILL_GRID_ROWS := 10
const SKILL_DOT_RADIUS := 5.0
const SKILL_CELL_X := 12.0
const SKILL_CELL_Y := 12.0
var SKILL_POOL_MAX_HP := 120.0
var DAMAGE_TO_SKILL_POOL := 10.0

const SWARM_COLS := 8
const SWARM_DOT_RADIUS := 6.0
const SWARM_CELL_X := 16.0
const SWARM_CELL_Y := 16.0
var SWARM_HIT_RADIUS := 10.0

const ELITE_COLS := 4
const ELITE_ROWS := 4
const ELITE_DOT_RADIUS := 6.0
const ELITE_CELL_X := 16.0
const ELITE_CELL_Y := 16.0

const BOSS_COLS := 6
const BOSS_ROWS := 6
const BOSS_DOT_RADIUS := 7.0
const BOSS_CELL_X := 16.0
const BOSS_CELL_Y := 16.0

var SWARM_FALL_SPEED := 50.0
var ELITE_FALL_SPEED := 90.0
var BOSS_FALL_SPEED := 50.0
var SWARM_SPAWN_INTERVAL := 0.55
var ELITE_SPAWN_INTERVAL := 0.85

var SKILL_COMMON_CD := 15.0
var SKILL_BASE_DAMAGE_MULT := 1.1
var SKILL_TICK_INTERVAL := 1.0
var BOSS_CONTROL_REDUCTION := 0.5

const SKILL_DA_SHOU_LI_JIAN := "大手里剑"
const SKILL_KU_WU := "苦无"
const SKILL_YING_FEN_SHEN := "影分身"
const SKILL_HAO_HUO_QIU := "火遁.豪火球"
const SKILL_FENG_XIAN_HUA := "火遁.凤仙花"
const SKILL_TU_LIU_BI := "土遁.土流壁"
const SKILL_HUANG_QUAN_ZHAO := "土遁·黄泉沼"

var DA_SHOU_LI_JIAN_RADIUS_CELLS := 2.0
var DA_SHOU_LI_JIAN_LINGER := 1.0
var DA_SHOU_LI_JIAN_DAMAGE := 1.1

var KU_WU_EXTRA_PIERCE := 1
var KU_WU_POISON_DAMAGE := 1.0
var KU_WU_POISON_DURATION := 5.0

var YING_FEN_SHEN_COUNT := 1
var YING_FEN_SHEN_DURATION := 5.0
var YING_FEN_SHEN_MAX := 10

var HAO_HUO_QIU_DIRECT_DAMAGE := 5.0
var HAO_HUO_QIU_EXPLODE_RADIUS_CELLS := 2.0
var HAO_HUO_QIU_KNOCKBACK_CELLS := 1.0

var FENG_XIAN_HUA_COUNT := 3
var FENG_XIAN_HUA_DAMAGE := 5.0
var FENG_XIAN_HUA_BURN_DAMAGE := 1.0
var FENG_XIAN_HUA_BURN_DURATION := 5.0

var TU_LIU_BI_HP := 50.0
var TU_LIU_BI_DURATION := 5.0
var TU_LIU_BI_WIDTH_UNITS := 2.0
var TU_LIU_BI_CONTACT_DPS := 8.0

var HUANG_QUAN_ZHAO_RADIUS_CELLS := 3.0
var HUANG_QUAN_ZHAO_DURATION := 5.0
var HUANG_QUAN_ZHAO_SLOW := 0.2
var HUANG_QUAN_ZHAO_ARMOR_BREAK := 0.2

var _play_rect := Rect2()
var _wall_rect := Rect2()
var _road_rect := Rect2()
var _skill_lane_rect := Rect2()
var _enemy_lane_rect := Rect2()

var _last_viewport_size := Vector2.ZERO
var _hero_pos := Vector2.ZERO
var _hero_initialized := false

var _projectiles: Array[Dictionary] = []
var _rng := RandomNumberGenerator.new()
var _cfg_skill_data: Dictionary = {}

var _skill_pool_hp := 0.0
var _unlocked_skill_count := 0
var _unlocked_skills: Array[String] = []
var _last_unlocked_skill := ""
var _last_upgraded_skill := ""
var _available_skill_pool: Array[String] = []
var _skill_levels: Dictionary = {}

var _skill_cooldowns: Dictionary = {}
var _poison_effects: Array[Dictionary] = []
var _shuriken_areas: Array[Dictionary] = []
var _burn_areas: Array[Dictionary] = []
var _swamp_areas: Array[Dictionary] = []
var _earth_walls: Array[Dictionary] = []
var _clones: Array[Dictionary] = []

var _swarm_enemies: Array[Dictionary] = []
var _elite_enemies: Array[Dictionary] = []
var _boss_enemies: Array[Dictionary] = []
var _next_enemy_id := 1

var _shoot_timer := 0.0
var _next_wave_to_spawn := 1
var _active_wave := 0
var _wave_phase := 0 # 0=普通敌人, 1=精英怪, 2=Boss
var _phase_spawn_left := 0
var _phase_spawn_unit_hp := 1.0
var _phase_spawn_timer := 0.0

var _game_over := false
var _victory := false
var _level_cleared_handled := false

var _move_left_pressed := false
var _move_right_pressed := false

var _kill_count := 0
var _hero_level := 1
var _next_level_idx := 0
var _level_kill_requirements: Array[int] = [6, 14, 24, 36, 50, 66, 84, 104, 126]
var _bullet_count_upgrade := 0
var _bullet_speed_upgrade := 0
var _bullet_damage_upgrade := 0
var _bullet_count_per_upgrade := 1
var _bullet_speed_per_upgrade := 0.10
var _bullet_damage_per_upgrade := 0.20
var _level_cfg: Dictionary = {}
var _unlock_focus := false
var _unlock_gate_mode := "none"
var _unlock_target_count := 0
var _level_unlock_gain_count := 0
var _unlock_opportunity_remaining := 0
var _fail_streak := 0
var _assist_step := 0
var _hero_anim_frame := 0
var _hero_anim_timer := 0.0
var _hero_anim_last_x := 0.0
var _hero_face_left := false
var _hero_texture: Texture2D = null
var _pixel_textures: Dictionary = {}


func _load_balance_config() -> void:
	var world := GameBalance.world()
	var enemy := GameBalance.enemy()
	var runtime := GameBalance.skill_runtime()
	var progression := GameBalance.progression()
	_cfg_skill_data = GameBalance.skills()
	_available_skill_pool = GameBalance.skill_unlock_pool()

	HERO_SIZE = world.get("hero_size", HERO_SIZE)
	HERO_SPEED = float(world.get("hero_speed", HERO_SPEED))
	PROJECTILE_SPEED = float(world.get("projectile_speed", PROJECTILE_SPEED))
	PROJECTILE_RADIUS = float(world.get("projectile_radius", PROJECTILE_RADIUS))
	PROJECTILE_HIT_RADIUS = float(world.get("projectile_hit_radius", PROJECTILE_HIT_RADIUS))
	PROJECTILE_SEGMENT_LENGTH = float(world.get("projectile_segment_length", PROJECTILE_SEGMENT_LENGTH))
	PROJECTILE_ARM_DISTANCE = float(world.get("projectile_arm_distance", PROJECTILE_ARM_DISTANCE))
	SHOOT_INTERVAL = float(world.get("shoot_interval", SHOOT_INTERVAL))
	HERO_BASE_ATTACK = float(world.get("hero_base_attack", HERO_BASE_ATTACK))
	SKILL_POOL_MAX_HP = float(world.get("skill_pool_max_hp", SKILL_POOL_MAX_HP))
	DAMAGE_TO_SKILL_POOL = float(world.get("damage_to_skill_pool", DAMAGE_TO_SKILL_POOL))
	BOSS_CONTROL_REDUCTION = float(world.get("boss_control_reduction", BOSS_CONTROL_REDUCTION))

	TOTAL_WAVES = int(enemy.get("total_waves", TOTAL_WAVES))
	WAVE_BASE_COUNT = int(enemy.get("wave_base_count", WAVE_BASE_COUNT))
	WAVE_COUNT_STEP = int(enemy.get("wave_count_step", WAVE_COUNT_STEP))
	WAVE_BASE_HP = float(enemy.get("wave_base_hp", WAVE_BASE_HP))
	WAVE_HP_STEP = float(enemy.get("wave_hp_step", WAVE_HP_STEP))
	WAVE_BASE_ELITE_HP = float(enemy.get("wave_base_elite_hp", WAVE_BASE_ELITE_HP))
	WAVE_ELITE_HP_STEP = float(enemy.get("wave_elite_hp_step", WAVE_ELITE_HP_STEP))
	BOSS_MAX_HP = float(enemy.get("boss_max_hp", BOSS_MAX_HP))
	SWARM_FALL_SPEED = float(enemy.get("swarm_fall_speed", SWARM_FALL_SPEED))
	ELITE_FALL_SPEED = float(enemy.get("elite_fall_speed", ELITE_FALL_SPEED))
	BOSS_FALL_SPEED = float(enemy.get("boss_fall_speed", BOSS_FALL_SPEED))
	SWARM_HIT_RADIUS = float(enemy.get("swarm_hit_radius", SWARM_HIT_RADIUS))
	SWARM_SPAWN_INTERVAL = float(enemy.get("swarm_spawn_interval", SWARM_SPAWN_INTERVAL))
	ELITE_SPAWN_INTERVAL = float(enemy.get("elite_spawn_interval", ELITE_SPAWN_INTERVAL))

	SKILL_COMMON_CD = float(runtime.get("common_cd", SKILL_COMMON_CD))
	SKILL_BASE_DAMAGE_MULT = float(runtime.get("base_damage_mult", SKILL_BASE_DAMAGE_MULT))
	SKILL_TICK_INTERVAL = float(runtime.get("tick_interval", SKILL_TICK_INTERVAL))
	_level_kill_requirements.clear()
	for value in progression.get("kill_requirements", _level_kill_requirements):
		_level_kill_requirements.append(int(value))
	_bullet_count_per_upgrade = int(progression.get("bullet_count_per_upgrade", _bullet_count_per_upgrade))
	_bullet_speed_per_upgrade = float(progression.get("bullet_speed_per_upgrade", _bullet_speed_per_upgrade))
	_bullet_damage_per_upgrade = float(progression.get("bullet_damage_per_upgrade", _bullet_damage_per_upgrade))
	_load_level_runtime_config()
	_load_skill_values()
	_skill_pool_hp = SKILL_POOL_MAX_HP


func _load_level_runtime_config() -> void:
	_level_cfg = LevelCatalog.get_level_config(level_id)
	_unlock_focus = bool(_level_cfg.get("unlock_focus", false))
	_unlock_gate_mode = str(_level_cfg.get("unlock_gate_mode", "none"))
	var unlock_min := int(_level_cfg.get("unlock_target_count_min", 0))
	var unlock_max := int(_level_cfg.get("unlock_target_count_max", unlock_min))
	_unlock_target_count = _rng.randi_range(unlock_min, maxi(unlock_min, unlock_max)) if _unlock_focus else 0
	_unlock_opportunity_remaining = int(_level_cfg.get("unlock_opportunity_count", 0))
	_fail_streak = LevelProgress.get_level_fail_streak(level_id)
	_apply_difficulty_band()
	_apply_fail_assist()
	_restore_global_skill_progress()


func _restore_global_skill_progress() -> void:
	var skill_pool := GameBalance.skill_unlock_pool()
	var unlocked_global := LevelProgress.get_global_unlocked_skills(skill_pool)
	_unlocked_skills.clear()
	_skill_cooldowns.clear()
	for skill_name in unlocked_global:
		if _unlocked_skills.has(skill_name):
			continue
		_unlocked_skills.append(skill_name)
		_on_skill_unlocked(skill_name)
	_unlocked_skill_count = _unlocked_skills.size()
	_available_skill_pool.clear()
	if _unlock_focus and _unlock_gate_mode == "sequential":
		var cursor := LevelProgress.get_skill_unlock_cursor(skill_pool)
		if cursor < skill_pool.size():
			_available_skill_pool.append(skill_pool[cursor])
	else:
		for skill_name in skill_pool:
			if not _unlocked_skills.has(skill_name):
				_available_skill_pool.append(skill_name)


func _apply_difficulty_band() -> void:
	var band: Dictionary = _level_cfg.get("difficulty_band", {})
	var hp_scale := float(band.get("hp_scale", 1.0))
	var speed_scale := float(band.get("speed_scale", 1.0))
	var spawn_scale := float(band.get("spawn_scale", 1.0))
	_apply_enemy_scales(hp_scale, speed_scale, spawn_scale)
	var pressure := _estimate_enemy_pressure()
	var pressure_min := float(band.get("pressure_min", pressure))
	var pressure_max := float(band.get("pressure_max", pressure))
	if pressure <= 0.0:
		return
	if pressure < pressure_min:
		var ratio_up := pressure_min / pressure
		_apply_enemy_scales(sqrt(ratio_up), sqrt(ratio_up), sqrt(ratio_up))
	elif pressure > pressure_max:
		var ratio_down := pressure_max / pressure
		var soften := clampf(sqrt(ratio_down), 0.65, 1.0)
		_apply_enemy_scales(soften, soften, soften)


func _apply_fail_assist() -> void:
	var assist: Dictionary = _level_cfg.get("assist_rules", {})
	if not bool(assist.get("enabled", false)):
		_assist_step = 0
		return
	var threshold := int(assist.get("fail_threshold", 2))
	var max_steps := int(assist.get("max_steps", 2))
	_assist_step = clampi(_fail_streak - threshold + 1, 0, max_steps)
	if _assist_step <= 0:
		return
	var hp_reduce := float(assist.get("hp_reduce_per_step", 0.06)) * float(_assist_step)
	var speed_reduce := float(assist.get("speed_reduce_per_step", 0.04)) * float(_assist_step)
	var spawn_relax := float(assist.get("spawn_relax_per_step", 0.06)) * float(_assist_step)
	var hp_scale := clampf(1.0 - hp_reduce, 0.70, 1.0)
	var speed_scale := clampf(1.0 - speed_reduce, 0.75, 1.0)
	var spawn_scale := clampf(1.0 - spawn_relax, 0.72, 1.0)
	_apply_enemy_scales(hp_scale, speed_scale, spawn_scale)


func _estimate_enemy_pressure() -> float:
	var hp := WAVE_BASE_HP
	var speed := SWARM_FALL_SPEED
	var density := 1.0 / maxf(SWARM_SPAWN_INTERVAL, 0.05)
	return hp * speed * density


func _apply_enemy_scales(hp_scale: float, speed_scale: float, spawn_scale: float) -> void:
	WAVE_BASE_HP *= hp_scale
	WAVE_HP_STEP *= hp_scale
	WAVE_BASE_ELITE_HP *= hp_scale
	WAVE_ELITE_HP_STEP *= hp_scale
	BOSS_MAX_HP *= hp_scale
	SWARM_FALL_SPEED *= speed_scale
	ELITE_FALL_SPEED *= speed_scale
	BOSS_FALL_SPEED *= speed_scale
	var safe_spawn_scale := maxf(spawn_scale, 0.05)
	SWARM_SPAWN_INTERVAL /= safe_spawn_scale
	ELITE_SPAWN_INTERVAL /= safe_spawn_scale


func _skill_value(skill_name: String, key: String, default_value):
	var skill_cfg: Dictionary = _cfg_skill_data.get(skill_name, {})
	var base_cfg: Dictionary = skill_cfg.get("base", {})
	return base_cfg.get(key, default_value)


func _skill_upgrade_config(skill_name: String) -> Dictionary:
	var skill_cfg: Dictionary = _cfg_skill_data.get(skill_name, {})
	return skill_cfg.get("upgrade", {})


func _skill_upgrade_value(skill_name: String, key: String, default_value):
	var upgrade_cfg := _skill_upgrade_config(skill_name)
	return upgrade_cfg.get(key, default_value)


func _skill_level(skill_name: String) -> int:
	return int(_skill_levels.get(skill_name, 0))


func _load_skill_values() -> void:
	var da_level := _skill_level(SKILL_DA_SHOU_LI_JIAN)
	var da_base_radius := float(_skill_value(SKILL_DA_SHOU_LI_JIAN, "radius_cells", DA_SHOU_LI_JIAN_RADIUS_CELLS))
	var da_radius_per_level := float(_skill_upgrade_value(SKILL_DA_SHOU_LI_JIAN, "radius_cells_per_level", 0.0))
	DA_SHOU_LI_JIAN_RADIUS_CELLS = da_base_radius + da_radius_per_level * da_level
	var da_base_linger := float(_skill_value(SKILL_DA_SHOU_LI_JIAN, "linger_seconds", DA_SHOU_LI_JIAN_LINGER))
	var da_linger_percent := float(_skill_upgrade_value(SKILL_DA_SHOU_LI_JIAN, "linger_percent_per_level", 0.0))
	DA_SHOU_LI_JIAN_LINGER = da_base_linger * (1.0 + da_linger_percent * da_level)
	DA_SHOU_LI_JIAN_DAMAGE = HERO_BASE_ATTACK * float(_skill_value(SKILL_DA_SHOU_LI_JIAN, "damage_mult", SKILL_BASE_DAMAGE_MULT))

	var ku_level := _skill_level(SKILL_KU_WU)
	var ku_base_pierce := int(_skill_value(SKILL_KU_WU, "extra_pierce", KU_WU_EXTRA_PIERCE))
	var ku_pierce_per_level := int(_skill_upgrade_value(SKILL_KU_WU, "extra_pierce_per_level", 0))
	KU_WU_EXTRA_PIERCE = ku_base_pierce + ku_pierce_per_level * ku_level
	var ku_base_poison_damage := float(_skill_value(SKILL_KU_WU, "poison_damage", KU_WU_POISON_DAMAGE))
	var ku_poison_damage_per_level := float(_skill_upgrade_value(SKILL_KU_WU, "poison_damage_per_level", 0.0))
	KU_WU_POISON_DAMAGE = ku_base_poison_damage + ku_poison_damage_per_level * ku_level
	var ku_base_poison_duration := float(_skill_value(SKILL_KU_WU, "poison_duration", KU_WU_POISON_DURATION))
	var ku_poison_duration_per_level := float(_skill_upgrade_value(SKILL_KU_WU, "poison_duration_per_level", 0.0))
	KU_WU_POISON_DURATION = ku_base_poison_duration + ku_poison_duration_per_level * ku_level

	var clone_level := _skill_level(SKILL_YING_FEN_SHEN)
	var clone_base_count := int(_skill_value(SKILL_YING_FEN_SHEN, "count", YING_FEN_SHEN_COUNT))
	var clone_count_per_level := int(_skill_upgrade_value(SKILL_YING_FEN_SHEN, "count_per_level", 0))
	YING_FEN_SHEN_COUNT = clone_base_count + clone_count_per_level * clone_level
	var clone_base_duration := float(_skill_value(SKILL_YING_FEN_SHEN, "duration", YING_FEN_SHEN_DURATION))
	var clone_duration_per_level := float(_skill_upgrade_value(SKILL_YING_FEN_SHEN, "duration_per_level", 0.0))
	YING_FEN_SHEN_DURATION = clone_base_duration + clone_duration_per_level * clone_level
	var clone_base_max := int(_skill_value(SKILL_YING_FEN_SHEN, "max_alive", YING_FEN_SHEN_MAX))
	var clone_max_per_level := int(_skill_upgrade_value(SKILL_YING_FEN_SHEN, "max_alive_per_level", 0))
	YING_FEN_SHEN_MAX = clone_base_max + clone_max_per_level * clone_level

	var fireball_level := _skill_level(SKILL_HAO_HUO_QIU)
	var fireball_base_direct_damage := float(_skill_value(SKILL_HAO_HUO_QIU, "direct_damage", HAO_HUO_QIU_DIRECT_DAMAGE))
	var fireball_direct_damage_per_level := float(_skill_upgrade_value(SKILL_HAO_HUO_QIU, "direct_damage_per_level", 0.0))
	HAO_HUO_QIU_DIRECT_DAMAGE = fireball_base_direct_damage + fireball_direct_damage_per_level * fireball_level
	var fireball_base_explode_radius := float(_skill_value(SKILL_HAO_HUO_QIU, "explode_radius_cells", HAO_HUO_QIU_EXPLODE_RADIUS_CELLS))
	var fireball_explode_radius_per_level := float(_skill_upgrade_value(SKILL_HAO_HUO_QIU, "explode_radius_cells_per_level", 0.0))
	HAO_HUO_QIU_EXPLODE_RADIUS_CELLS = fireball_base_explode_radius + fireball_explode_radius_per_level * fireball_level
	var fireball_base_knockback := float(_skill_value(SKILL_HAO_HUO_QIU, "knockback_cells", HAO_HUO_QIU_KNOCKBACK_CELLS))
	var fireball_knockback_per_level := float(_skill_upgrade_value(SKILL_HAO_HUO_QIU, "knockback_cells_per_level", 0.0))
	HAO_HUO_QIU_KNOCKBACK_CELLS = fireball_base_knockback + fireball_knockback_per_level * fireball_level

	var phoenix_level := _skill_level(SKILL_FENG_XIAN_HUA)
	var phoenix_base_count := int(_skill_value(SKILL_FENG_XIAN_HUA, "count", FENG_XIAN_HUA_COUNT))
	var phoenix_count_per_level := int(_skill_upgrade_value(SKILL_FENG_XIAN_HUA, "count_per_level", 0))
	FENG_XIAN_HUA_COUNT = phoenix_base_count + phoenix_count_per_level * phoenix_level
	FENG_XIAN_HUA_DAMAGE = float(_skill_value(SKILL_FENG_XIAN_HUA, "hit_damage", FENG_XIAN_HUA_DAMAGE))
	var phoenix_base_burn_damage := float(_skill_value(SKILL_FENG_XIAN_HUA, "burn_damage", FENG_XIAN_HUA_BURN_DAMAGE))
	var phoenix_burn_damage_per_level := float(_skill_upgrade_value(SKILL_FENG_XIAN_HUA, "burn_damage_per_level", 0.0))
	FENG_XIAN_HUA_BURN_DAMAGE = phoenix_base_burn_damage + phoenix_burn_damage_per_level * phoenix_level
	var phoenix_base_burn_duration := float(_skill_value(SKILL_FENG_XIAN_HUA, "burn_duration", FENG_XIAN_HUA_BURN_DURATION))
	var phoenix_burn_duration_per_level := float(_skill_upgrade_value(SKILL_FENG_XIAN_HUA, "burn_duration_per_level", 0.0))
	FENG_XIAN_HUA_BURN_DURATION = phoenix_base_burn_duration + phoenix_burn_duration_per_level * phoenix_level

	var earth_level := _skill_level(SKILL_TU_LIU_BI)
	var earth_base_hp := float(_skill_value(SKILL_TU_LIU_BI, "wall_hp", TU_LIU_BI_HP))
	var earth_hp_per_level := float(_skill_upgrade_value(SKILL_TU_LIU_BI, "wall_hp_per_level", 0.0))
	TU_LIU_BI_HP = earth_base_hp + earth_hp_per_level * earth_level
	var earth_base_duration := float(_skill_value(SKILL_TU_LIU_BI, "duration", TU_LIU_BI_DURATION))
	var earth_duration_per_level := float(_skill_upgrade_value(SKILL_TU_LIU_BI, "duration_per_level", 0.0))
	TU_LIU_BI_DURATION = earth_base_duration + earth_duration_per_level * earth_level
	var earth_base_width := float(_skill_value(SKILL_TU_LIU_BI, "width_units", TU_LIU_BI_WIDTH_UNITS))
	var earth_width_per_level := float(_skill_upgrade_value(SKILL_TU_LIU_BI, "width_units_per_level", 0.0))
	TU_LIU_BI_WIDTH_UNITS = earth_base_width + earth_width_per_level * earth_level
	TU_LIU_BI_CONTACT_DPS = float(_skill_value(SKILL_TU_LIU_BI, "contact_dps", TU_LIU_BI_CONTACT_DPS))

	var swamp_level := _skill_level(SKILL_HUANG_QUAN_ZHAO)
	var swamp_base_radius := float(_skill_value(SKILL_HUANG_QUAN_ZHAO, "radius_cells", HUANG_QUAN_ZHAO_RADIUS_CELLS))
	var swamp_radius_per_level := float(_skill_upgrade_value(SKILL_HUANG_QUAN_ZHAO, "radius_cells_per_level", 0.0))
	HUANG_QUAN_ZHAO_RADIUS_CELLS = swamp_base_radius + swamp_radius_per_level * swamp_level
	var swamp_base_duration := float(_skill_value(SKILL_HUANG_QUAN_ZHAO, "duration", HUANG_QUAN_ZHAO_DURATION))
	var swamp_duration_per_level := float(_skill_upgrade_value(SKILL_HUANG_QUAN_ZHAO, "duration_per_level", 0.0))
	HUANG_QUAN_ZHAO_DURATION = swamp_base_duration + swamp_duration_per_level * swamp_level
	var swamp_base_slow := float(_skill_value(SKILL_HUANG_QUAN_ZHAO, "slow_ratio", HUANG_QUAN_ZHAO_SLOW))
	var swamp_slow_per_level := float(_skill_upgrade_value(SKILL_HUANG_QUAN_ZHAO, "slow_ratio_per_level", 0.0))
	HUANG_QUAN_ZHAO_SLOW = swamp_base_slow + swamp_slow_per_level * swamp_level
	var swamp_base_armor_break := float(_skill_value(SKILL_HUANG_QUAN_ZHAO, "armor_break_ratio", HUANG_QUAN_ZHAO_ARMOR_BREAK))
	var swamp_armor_break_per_level := float(_skill_upgrade_value(SKILL_HUANG_QUAN_ZHAO, "armor_break_ratio_per_level", 0.0))
	HUANG_QUAN_ZHAO_ARMOR_BREAK = swamp_base_armor_break + swamp_armor_break_per_level * swamp_level


func _ready() -> void:
	_rng.randomize()
	_load_hero_texture()
	_load_pixel_textures()
	_load_balance_config()
	GameManager.start_game()
	game_over_popup.visible = false
	victory_popup.visible = false
	skill_drop_label.visible = true
	restart_button.pressed.connect(_on_restart_pressed)
	select_level_on_fail_button.pressed.connect(_on_select_level_pressed)
	next_level_button.pressed.connect(_on_next_level_pressed)
	select_level_button.pressed.connect(_on_select_level_pressed)
	move_left_btn.button_down.connect(_on_move_left_down)
	move_left_btn.button_up.connect(_on_move_left_up)
	move_right_btn.button_down.connect(_on_move_right_down)
	move_right_btn.button_up.connect(_on_move_right_up)
	_refresh_layout_if_needed(true)
	_spawn_next_stage()
	swarm_hp_label.add_theme_color_override("font_color", Color(1.0, 0.0, 0.0))
	swarm_hp_label.add_theme_color_override("font_outline_color", Color(0.0, 0.0, 0.0))
	swarm_hp_label.add_theme_constant_override("outline_size", 2)
	skill_pool_hp_label.add_theme_color_override("font_color", Color(0.92, 0.24, 0.10))
	skill_pool_hp_label.add_theme_color_override("font_outline_color", Color(0.0, 0.0, 0.0))
	skill_pool_hp_label.add_theme_constant_override("outline_size", 2)
	skill_pool_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_update_top_info()
	queue_redraw()


func _process(delta: float) -> void:
	_refresh_layout_if_needed(false)
	if not _game_over and not _victory:
		_update_hero_move(delta)
		_update_hero_animation(delta)
		_update_clone_positions()
		_update_auto_shoot(delta)
		_update_skill_system(delta)
		_update_enemy_spawn(delta)
		_update_projectiles(delta)
		_update_enemy_movement(delta)
		_check_enemy_reach_hero_line()
		_check_enemy_touch_hero()
		_check_stage_advance()
	_update_top_info()
	queue_redraw()


func _input(event: InputEvent) -> void:
	if event is InputEventKey:
		if event.keycode == KEY_A or event.keycode == KEY_LEFT:
			_move_left_pressed = event.pressed
		elif event.keycode == KEY_D or event.keycode == KEY_RIGHT:
			_move_right_pressed = event.pressed
	elif event is InputEventScreenTouch:
		if event.pressed:
			_move_hero_to_x(event.position.x)
	elif event is InputEventScreenDrag:
		_move_hero_to_x(event.position.x)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, get_viewport_rect().size), Color(1.0, 1.0, 1.0), true)
	draw_rect(_play_rect, Color(1.0, 0.1, 0.1), false, 3.0)
	draw_rect(_road_rect, Color(0.92, 0.92, 0.94), true)
	draw_rect(_wall_rect, Color(0.25, 0.25, 0.28), false, 4.0)
	_draw_hero()
	_draw_clones()
	_draw_projectiles()
	_draw_skill_effects()
	_draw_skill_grid()
	_draw_enemy_groups()


func _draw_hero() -> void:
	var rect := Rect2(_hero_pos - HERO_SIZE * 0.5, HERO_SIZE)
	if _hero_texture == null:
		draw_rect(rect, Color(0.18, 0.40, 1.0), true)
		return
	var src_rect: Rect2 = HERO_FRAME_SOURCES[_hero_anim_frame]
	var dest_rect := rect
	if _hero_face_left:
		dest_rect = Rect2(rect.position + Vector2(rect.size.x, 0), Vector2(-rect.size.x, rect.size.y))
	draw_texture_rect_region(_hero_texture, dest_rect, src_rect, Color.WHITE, false)


func _load_hero_texture() -> void:
	var image := Image.new()
	var err := image.load("res://assets/role/mainRole.png")
	if err == OK:
		_hero_texture = ImageTexture.create_from_image(image)


func _load_pixel_textures() -> void:
	_pixel_textures.clear()
	for texture_key in PIXEL_ASSET_PATHS.keys():
		var image := Image.new()
		var err := image.load(str(PIXEL_ASSET_PATHS[texture_key]))
		if err == OK:
			_pixel_textures[texture_key] = ImageTexture.create_from_image(image)


func _draw_texture_centered(texture_key: String, center: Vector2, size: Vector2) -> bool:
	if not _pixel_textures.has(texture_key):
		return false
	var texture: Texture2D = _pixel_textures[texture_key]
	draw_texture_rect(texture, Rect2(center - size * 0.5, size), false, Color.WHITE)
	return true


func _projectile_texture_key(projectile_type: String) -> String:
	if projectile_type == "kunai":
		return "kunai"
	if projectile_type == "fireball":
		return "fireball"
	if projectile_type == "phoenix":
		return "phoenix_ember"
	return "basic_bolt"


func _projectile_texture_size(projectile_type: String) -> Vector2:
	if projectile_type == "kunai":
		return Vector2(18, 18)
	if projectile_type == "fireball":
		return Vector2(28, 28)
	if projectile_type == "phoenix":
		return Vector2(22, 22)
	if projectile_type == "clone_basic":
		return Vector2(14, 14)
	return Vector2(16, 16)


func _draw_clones() -> void:
	for clone in _clones:
		var pos: Vector2 = clone["pos"]
		var rect := Rect2(pos - HERO_SIZE * 0.42, HERO_SIZE * 0.84)
		if _hero_texture == null:
			draw_rect(rect, Color(0.35, 0.72, 1.0, 0.75), true)
		else:
			var src_rect: Rect2 = HERO_FRAME_SOURCES[_hero_anim_frame]
			draw_texture_rect_region(_hero_texture, rect, src_rect, Color(0.45, 0.75, 1.0, 0.58), false)


func _draw_projectiles() -> void:
	for projectile in _projectiles:
		var pos: Vector2 = projectile["pos"]
		var velocity: Vector2 = projectile["velocity"]
		var type: String = projectile["type"]
		var texture_key := _projectile_texture_key(type)
		var texture_size := _projectile_texture_size(type)
		if _draw_texture_centered(texture_key, pos, texture_size):
			continue
		var color := Color.BLACK
		if type == "kunai":
			color = Color(0.12, 0.12, 0.12)
		elif type == "fireball":
			color = Color(1.0, 0.44, 0.1)
		elif type == "phoenix":
			color = Color(1.0, 0.58, 0.18)
		elif type == "clone_basic":
			color = Color(0.18, 0.45, 1.0)
		var dir := Vector2.UP if velocity.is_zero_approx() else velocity.normalized()
		var tail := pos - dir * PROJECTILE_SEGMENT_LENGTH
		draw_line(pos, tail, color, 3.0, true)


func _draw_skill_effects() -> void:
	for area in _shuriken_areas:
		draw_circle(area["pos"], float(area["radius"]), Color(0.98, 0.72, 0.18, 0.24))
		_draw_texture_centered("shuriken", area["pos"], Vector2(48, 48))
	for area in _burn_areas:
		if not _draw_texture_centered("burn_patch", area["pos"], Vector2.ONE * float(area["radius"]) * 2.0):
			draw_circle(area["pos"], float(area["radius"]), Color(1.0, 0.48, 0.12, 0.18))
	for area in _swamp_areas:
		if not _draw_texture_centered("swamp_pool", area["pos"], Vector2.ONE * float(area["radius"]) * 2.0):
			draw_circle(area["pos"], float(area["radius"]), Color(0.40, 0.30, 0.12, 0.30))
	for wall in _earth_walls:
		var rect: Rect2 = wall["rect"]
		if _pixel_textures.has("earth_wall"):
			var texture: Texture2D = _pixel_textures["earth_wall"]
			draw_texture_rect(texture, rect, false, Color.WHITE)
		else:
			draw_rect(rect, Color(0.56, 0.42, 0.26, 0.78), true)
			draw_rect(rect, Color(0.25, 0.16, 0.08), false, 2.0)


func _draw_skill_grid() -> void:
	var bounds := _get_skill_grid_bounds()
	var alive_cells := int(ceil((_skill_pool_hp / SKILL_POOL_MAX_HP) * float(SKILL_GRID_COLS * SKILL_GRID_ROWS)))
	alive_cells = clampi(alive_cells, 0, SKILL_GRID_COLS * SKILL_GRID_ROWS)
	var left := bounds.position.x + SKILL_DOT_RADIUS
	var top := bounds.position.y + SKILL_DOT_RADIUS
	for row in range(SKILL_GRID_ROWS):
		for col in range(SKILL_GRID_COLS):
			var idx := row * SKILL_GRID_COLS + col
			var pos := Vector2(left + float(col) * SKILL_CELL_X, top + float(row) * SKILL_CELL_Y)
			var texture_key := "chakra_orb" if idx < alive_cells else "spent_orb"
			if not _draw_texture_centered(texture_key, pos, Vector2(12, 12)):
				var color := Color(0.98, 0.70, 0.1) if idx < alive_cells else Color(0.80, 0.80, 0.80)
				draw_circle(pos, SKILL_DOT_RADIUS, color)


func _draw_enemy_groups() -> void:
	_draw_enemy_matrix(_swarm_enemies, SWARM_DOT_RADIUS, Color(0.95, 0.08, 0.08), "enemy_imp", Vector2(20, 20))
	_draw_enemy_matrix(_elite_enemies, ELITE_DOT_RADIUS, Color(0.84, 0.1, 0.1), "enemy_elite", Vector2(24, 24))
	_draw_enemy_matrix(_boss_enemies, BOSS_DOT_RADIUS, Color(0.72, 0.02, 0.02), "enemy_boss", Vector2(34, 34))


func _draw_enemy_matrix(enemies: Array[Dictionary], radius: float, color: Color, texture_key: String, texture_size: Vector2) -> void:
	for enemy in enemies:
		if not _draw_texture_centered(texture_key, enemy["pos"], texture_size):
			draw_circle(enemy["pos"], radius, color)


func _refresh_layout_if_needed(force: bool) -> void:
	var viewport_size := get_viewport_rect().size
	if not force and viewport_size == _last_viewport_size:
		return
	_last_viewport_size = viewport_size
	_layout_world(viewport_size)
	if not _hero_initialized:
		_hero_pos = Vector2(_play_rect.get_center().x, _play_rect.end.y - 92.0)
		_hero_initialized = true
		_hero_anim_last_x = _hero_pos.x
	else:
		_hero_pos.y = _play_rect.end.y - 92.0
		_hero_pos.x = clampf(_hero_pos.x, _play_rect.position.x + 34.0, _play_rect.end.x - 34.0)
	_recenter_enemy_groups_x()
	_update_clone_positions()


func _layout_world(viewport_size: Vector2) -> void:
	var top_reserved := 88.0
	var bottom_reserved := 180.0
	var side_margin := viewport_size.x * 0.08
	_play_rect = Rect2(
		Vector2(side_margin, top_reserved),
		Vector2(viewport_size.x - side_margin * 2.0, viewport_size.y - top_reserved - bottom_reserved)
	)
	var road_width: float = clampf(viewport_size.x * 0.12, 28.0, 54.0)
	var road_height := _play_rect.size.y * 0.62
	var road_top := _play_rect.position.y + _play_rect.size.y * 0.08
	if road_top + road_height > _play_rect.end.y - 180.0:
		road_height = _play_rect.end.y - 180.0 - road_top
	road_height = maxf(road_height, 220.0)
	_road_rect = Rect2(
		Vector2(_play_rect.get_center().x - road_width * 0.95, road_top),
		Vector2(road_width * 1.9, road_height)
	)
	_wall_rect = Rect2(
		Vector2(_play_rect.get_center().x - road_width * 0.5, road_top),
		Vector2(road_width, road_height)
	)
	var lane_top := _road_rect.position.y + 26.0
	var lane_bottom := _road_rect.end.y - 18.0
	_skill_lane_rect = Rect2(
		Vector2(_play_rect.position.x + 20.0, lane_top),
		Vector2(_wall_rect.position.x - _play_rect.position.x - 40.0, lane_bottom - lane_top)
	)
	_enemy_lane_rect = Rect2(
		Vector2(_wall_rect.end.x + 20.0, lane_top),
		Vector2(_play_rect.end.x - _wall_rect.end.x - 40.0, lane_bottom - lane_top)
	)
	swarm_hp_label.offset_left = _enemy_lane_rect.position.x - 12.0
	swarm_hp_label.offset_top = _enemy_lane_rect.position.y + 24.0
	swarm_hp_label.offset_right = _enemy_lane_rect.end.x + 12.0
	swarm_hp_label.offset_bottom = swarm_hp_label.offset_top + 34.0
	swarm_hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_update_skill_pool_indicator_position()


func _update_hero_move(delta: float) -> void:
	var direction := 0.0
	if _move_left_pressed:
		direction -= 1.0
	if _move_right_pressed:
		direction += 1.0
	var min_x := _play_rect.position.x + 34.0
	var max_x := _play_rect.end.x - 34.0
	_hero_pos.x = clampf(_hero_pos.x + direction * HERO_SPEED * delta, min_x, max_x)


func _update_hero_animation(delta: float) -> void:
	var dx := _hero_pos.x - _hero_anim_last_x
	var moving := absf(dx) > 0.01
	if moving:
		_hero_face_left = dx < 0.0
		_hero_anim_timer += delta * HERO_ANIM_FPS
		while _hero_anim_timer >= 1.0:
			_hero_anim_timer -= 1.0
			_hero_anim_frame = (_hero_anim_frame + 1) % HERO_FRAME_COUNT
	else:
		_hero_anim_frame = 0
		_hero_anim_timer = 0.0
	_hero_anim_last_x = _hero_pos.x


func _update_auto_shoot(delta: float) -> void:
	_shoot_timer += delta
	while _shoot_timer >= SHOOT_INTERVAL:
		_shoot_timer -= SHOOT_INTERVAL
		var start_pos := _hero_pos + Vector2(0, -24)
		_spawn_upward_bullets(start_pos, "basic", _current_bullet_damage(), _current_bullet_speed())
		if _has_skill(SKILL_KU_WU):
			_spawn_upward_bullets(start_pos, "kunai", _current_bullet_damage(), _current_bullet_speed(), KU_WU_EXTRA_PIERCE)
	_update_clone_auto_shoot(delta)


func _update_clone_auto_shoot(delta: float) -> void:
	for i in range(_clones.size()):
		var clone: Dictionary = _clones[i]
		clone["shoot_timer"] = float(clone["shoot_timer"]) + delta
		while float(clone["shoot_timer"]) >= SHOOT_INTERVAL:
			clone["shoot_timer"] = float(clone["shoot_timer"]) - SHOOT_INTERVAL
			var clone_pos: Vector2 = clone["pos"]
			_spawn_upward_bullets(clone_pos + Vector2(0, -22), "clone_basic", _current_bullet_damage(), _current_bullet_speed())
		_clones[i] = clone


func _spawn_upward_bullets(start_pos: Vector2, projectile_type: String, damage: float, speed: float, pierce_left: int = 0) -> void:
	var bullet_count := _current_bullet_count()
	var center_idx := float(bullet_count - 1) * 0.5
	for i in range(bullet_count):
		var offset_x := (float(i) - center_idx) * 10.0
		var bullet_pos := start_pos + Vector2(offset_x, 0)
		_spawn_projectile(bullet_pos, Vector2.UP * speed, projectile_type, damage, pierce_left)


func _current_bullet_count() -> int:
	return 1 + _bullet_count_upgrade * _bullet_count_per_upgrade


func _current_bullet_speed() -> float:
	return PROJECTILE_SPEED * (1.0 + float(_bullet_speed_upgrade) * _bullet_speed_per_upgrade)


func _current_bullet_damage() -> float:
	return HERO_BASE_ATTACK * (1.0 + float(_bullet_damage_upgrade) * _bullet_damage_per_upgrade)


func _update_clone_positions() -> void:
	for i in range(_clones.size()):
		var clone: Dictionary = _clones[i]
		var offset_x: float = clone["offset_x"]
		var x := clampf(_hero_pos.x + offset_x, _play_rect.position.x + 34.0, _play_rect.end.x - 34.0)
		clone["pos"] = Vector2(x, _hero_pos.y)
		_clones[i] = clone


func _spawn_projectile(start_pos: Vector2, velocity: Vector2, projectile_type: String, damage: float, pierce_left: int = 0) -> void:
	_projectiles.append({
		"pos": start_pos,
		"velocity": velocity,
		"travel": 0.0,
		"type": projectile_type,
		"damage": damage,
		"pierce_left": pierce_left,
		"hit_ids": []
	})


func _update_projectiles(delta: float) -> void:
	var bounds := _play_rect.grow(100.0)
	var next_projectiles: Array[Dictionary] = []
	for projectile in _projectiles:
		var pos: Vector2 = projectile["pos"]
		var step: Vector2 = projectile["velocity"] * delta
		pos += step
		projectile["pos"] = pos
		projectile["travel"] = float(projectile["travel"]) + step.length()
		if not bounds.has_point(pos):
			continue
		var consumed := false
		if float(projectile["travel"]) >= PROJECTILE_ARM_DISTANCE:
			consumed = _apply_projectile_hit(projectile)
		if not consumed:
			next_projectiles.append(projectile)
	_projectiles = next_projectiles


func _apply_projectile_hit(projectile: Dictionary) -> bool:
	var wall_center_x := _wall_rect.get_center().x
	var pos: Vector2 = projectile["pos"]
	var type: String = projectile["type"]
	if pos.x < wall_center_x and (type == "basic" or type == "kunai" or type == "clone_basic"):
		return _hit_skill_pool(pos)
	return _hit_enemy_side(projectile)


func _hit_skill_pool(projectile_pos: Vector2) -> bool:
	var bounds := _get_skill_grid_bounds().grow(PROJECTILE_HIT_RADIUS)
	if not bounds.has_point(projectile_pos):
		return false
	_skill_pool_hp = maxf(_skill_pool_hp - DAMAGE_TO_SKILL_POOL, 0.0)
	if _skill_pool_hp <= 0.0:
		_skill_pool_hp = SKILL_POOL_MAX_HP
		_unlock_random_skill()
	return true


func _unlock_random_skill() -> void:
	if _available_skill_pool.is_empty():
		_last_unlocked_skill = "技能池已空"
		return
	var idx := _rng.randi_range(0, _available_skill_pool.size() - 1)
	var skill_name := _available_skill_pool[idx]
	if _unlock_focus and _unlock_gate_mode == "sequential":
		var skill_pool := GameBalance.skill_unlock_pool()
		if not LevelProgress.commit_skill_unlock(skill_name, skill_pool):
			_last_unlocked_skill = "当前阶段未达成"
			return
	_available_skill_pool.remove_at(idx)
	_last_unlocked_skill = skill_name
	if not _unlocked_skills.has(skill_name):
		_unlocked_skills.append(skill_name)
		_level_unlock_gain_count += 1
		_unlocked_skill_count = _unlocked_skills.size()
	_on_skill_unlocked(skill_name)
	if _unlock_focus and _unlock_gate_mode == "sequential":
		_available_skill_pool.clear()
		var all_skills := GameBalance.skill_unlock_pool()
		var next_cursor := LevelProgress.get_skill_unlock_cursor(all_skills)
		if next_cursor < all_skills.size():
			_available_skill_pool.append(all_skills[next_cursor])
		else:
			_last_unlocked_skill = "%s（已解锁全部）" % skill_name


func _on_skill_unlocked(skill_name: String) -> void:
	if not _skill_levels.has(skill_name):
		_skill_levels[skill_name] = 0
	if _is_active_skill(skill_name):
		_skill_cooldowns[skill_name] = 0.0
	if skill_name == SKILL_YING_FEN_SHEN:
		_cast_shadow_clone()


func _hit_enemy_side(projectile: Dictionary) -> bool:
	var projectile_pos: Vector2 = projectile["pos"]
	var candidates := _collect_hit_candidates(projectile_pos)
	if candidates.is_empty():
		return false
	var target_idx := _pick_enemy_by_order(candidates)
	var type: String = projectile["type"]
	var damage: float = projectile["damage"]
	if type == "kunai":
		var hit_ids: Array = projectile["hit_ids"]
		if hit_ids.has(target_idx["id"]):
			return false
		hit_ids.append(target_idx["id"])
		projectile["hit_ids"] = hit_ids
		_apply_damage_to_enemy_id(int(target_idx["id"]), damage)
		_add_poison_effect(int(target_idx["id"]), KU_WU_POISON_DAMAGE, KU_WU_POISON_DURATION, SKILL_TICK_INTERVAL)
		var pierce_left := int(projectile["pierce_left"])
		if pierce_left > 0:
			projectile["pierce_left"] = pierce_left - 1
			return false
		return true
	if type == "fireball":
		var center := Vector2(target_idx["pos"])
		_apply_damage_to_enemy_id(int(target_idx["id"]), HAO_HUO_QIU_DIRECT_DAMAGE)
		_apply_area_damage(center, _cells_to_radius(HAO_HUO_QIU_EXPLODE_RADIUS_CELLS), HAO_HUO_QIU_DIRECT_DAMAGE)
		_apply_knockback(center, _cells_to_radius(HAO_HUO_QIU_EXPLODE_RADIUS_CELLS), HAO_HUO_QIU_KNOCKBACK_CELLS)
		return true
	if type == "phoenix":
		var burn_center := Vector2(target_idx["pos"])
		_apply_damage_to_enemy_id(int(target_idx["id"]), FENG_XIAN_HUA_DAMAGE)
		_add_burn_area(burn_center, _cells_to_radius(2.0), FENG_XIAN_HUA_BURN_DAMAGE, FENG_XIAN_HUA_BURN_DURATION, SKILL_TICK_INTERVAL)
		return true
	_apply_damage_to_enemy_id(int(target_idx["id"]), damage)
	return true


func _collect_hit_candidates(projectile_pos: Vector2) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for i in range(_swarm_enemies.size()):
		if _touch_enemy(projectile_pos, _swarm_enemies[i]["pos"], SWARM_HIT_RADIUS):
			result.append({"group": 0, "index": i, "id": _swarm_enemies[i]["id"], "pos": _swarm_enemies[i]["pos"]})
	for i in range(_elite_enemies.size()):
		if _touch_enemy(projectile_pos, _elite_enemies[i]["pos"], ELITE_DOT_RADIUS):
			result.append({"group": 1, "index": i, "id": _elite_enemies[i]["id"], "pos": _elite_enemies[i]["pos"]})
	for i in range(_boss_enemies.size()):
		if _touch_enemy(projectile_pos, _boss_enemies[i]["pos"], BOSS_DOT_RADIUS):
			result.append({"group": 2, "index": i, "id": _boss_enemies[i]["id"], "pos": _boss_enemies[i]["pos"]})
	return result


func _touch_enemy(projectile_pos: Vector2, enemy_pos: Vector2, enemy_radius: float) -> bool:
	return projectile_pos.distance_to(enemy_pos) <= PROJECTILE_HIT_RADIUS + enemy_radius


func _pick_enemy_by_order(candidates: Array[Dictionary]) -> Dictionary:
	var best: Dictionary = candidates[0]
	for i in range(1, candidates.size()):
		var cur: Dictionary = candidates[i]
		var cur_pos: Vector2 = cur["pos"]
		var best_pos: Vector2 = best["pos"]
		if cur_pos.x < best_pos.x:
			best = cur
		elif is_equal_approx(cur_pos.x, best_pos.x) and cur_pos.y > best_pos.y:
			best = cur
	return best


func _update_skill_system(delta: float) -> void:
	_update_skill_cooldowns(delta)
	_cast_ready_skills()
	_update_dot_effects(_poison_effects, delta)
	_update_area_ticks(_shuriken_areas, delta)
	_update_area_ticks(_burn_areas, delta)
	_update_swamp_areas(delta)
	_update_earth_walls(delta)
	_update_clone_lifetime(delta)


func _update_skill_cooldowns(delta: float) -> void:
	for skill_name in _skill_cooldowns.keys():
		var time_left: float = _skill_cooldowns[skill_name]
		_skill_cooldowns[skill_name] = maxf(time_left - delta, 0.0)


func _cast_ready_skills() -> void:
	for skill_name in _unlocked_skills:
		if not _is_active_skill(skill_name):
			continue
		if not _skill_cooldowns.has(skill_name):
			_skill_cooldowns[skill_name] = 0.0
		if float(_skill_cooldowns[skill_name]) > 0.0:
			continue
		_cast_skill(skill_name)
		_skill_cooldowns[skill_name] = SKILL_COMMON_CD


func _cast_skill(skill_name: String) -> void:
	if skill_name == SKILL_DA_SHOU_LI_JIAN:
		_cast_da_shou_li_jian()
	elif skill_name == SKILL_YING_FEN_SHEN:
		_cast_shadow_clone()
	elif skill_name == SKILL_HAO_HUO_QIU:
		_cast_hao_huo_qiu()
	elif skill_name == SKILL_FENG_XIAN_HUA:
		_cast_feng_xian_hua()
	elif skill_name == SKILL_TU_LIU_BI:
		_cast_tu_liu_bi()
	elif skill_name == SKILL_HUANG_QUAN_ZHAO:
		_cast_huang_quan_zhao()


func _cast_da_shou_li_jian() -> void:
	var target := _pick_nearest_enemy()
	if target.is_empty():
		return
	var center: Vector2 = target["pos"]
	var radius := _cells_to_radius(DA_SHOU_LI_JIAN_RADIUS_CELLS)
	_apply_area_damage(center, radius, DA_SHOU_LI_JIAN_DAMAGE)
	_shuriken_areas.append({
		"pos": center,
		"radius": radius,
		"damage": DA_SHOU_LI_JIAN_DAMAGE,
		"time_left": DA_SHOU_LI_JIAN_LINGER,
		"tick_timer": SKILL_TICK_INTERVAL,
		"interval": SKILL_TICK_INTERVAL
	})


func _cast_shadow_clone() -> void:
	if _clones.size() >= YING_FEN_SHEN_MAX:
		return
	var create_count := mini(YING_FEN_SHEN_COUNT, YING_FEN_SHEN_MAX - _clones.size())
	for i in range(create_count):
		var slot := _clones.size() + i
		var offset_x := 56.0 + float(slot) * 46.0
		_clones.append({
			"offset_x": offset_x,
			"time_left": YING_FEN_SHEN_DURATION,
			"shoot_timer": 0.0,
			"pos": _hero_pos + Vector2(offset_x, 0)
		})
	_update_clone_positions()


func _cast_hao_huo_qiu() -> void:
	var target := _pick_nearest_enemy()
	if target.is_empty():
		return
	var start := _hero_pos + Vector2(0, -24)
	var target_pos: Vector2 = target["pos"]
	var dir := (target_pos - start)
	if dir.is_zero_approx():
		dir = Vector2.UP
	_spawn_projectile(start, dir.normalized() * PROJECTILE_SPEED, "fireball", HAO_HUO_QIU_DIRECT_DAMAGE)


func _cast_feng_xian_hua() -> void:
	for _i in range(FENG_XIAN_HUA_COUNT):
		var target := _pick_random_enemy()
		if target.is_empty():
			break
		var start := _hero_pos + Vector2(0, -24)
		var target_pos: Vector2 = target["pos"]
		var dir := (target_pos - start)
		if dir.is_zero_approx():
			dir = Vector2.UP
		_spawn_projectile(start, dir.normalized() * PROJECTILE_SPEED * 0.85, "phoenix", FENG_XIAN_HUA_DAMAGE)


func _cast_tu_liu_bi() -> void:
	var wall_height := TU_LIU_BI_WIDTH_UNITS * SWARM_CELL_Y
	var wall_top := _wall_rect.end.y - wall_height
	var rect := Rect2(
		Vector2(_enemy_lane_rect.position.x, wall_top),
		Vector2(_enemy_lane_rect.size.x, wall_height)
	)
	if _earth_walls.is_empty():
		_earth_walls.append({"rect": rect, "hp": TU_LIU_BI_HP, "time_left": TU_LIU_BI_DURATION})
	else:
		_earth_walls[0] = {"rect": rect, "hp": TU_LIU_BI_HP, "time_left": TU_LIU_BI_DURATION}


func _cast_huang_quan_zhao() -> void:
	var target := _pick_random_enemy()
	var center := _enemy_lane_rect.get_center()
	if not target.is_empty():
		center = target["pos"]
	_swamp_areas.append({
		"pos": center,
		"radius": _cells_to_radius(HUANG_QUAN_ZHAO_RADIUS_CELLS),
		"time_left": HUANG_QUAN_ZHAO_DURATION,
		"slow": HUANG_QUAN_ZHAO_SLOW,
		"armor_break": HUANG_QUAN_ZHAO_ARMOR_BREAK
	})


func _add_poison_effect(enemy_id: int, damage: float, duration: float, interval: float) -> void:
	_poison_effects.append({
		"enemy_id": enemy_id,
		"damage": damage,
		"time_left": duration,
		"tick_timer": interval,
		"interval": interval
	})


func _add_burn_area(center: Vector2, radius: float, damage: float, duration: float, interval: float) -> void:
	_burn_areas.append({
		"pos": center,
		"radius": radius,
		"damage": damage,
		"time_left": duration,
		"tick_timer": interval,
		"interval": interval
	})


func _update_dot_effects(effects: Array[Dictionary], delta: float) -> void:
	for i in range(effects.size() - 1, -1, -1):
		var effect: Dictionary = effects[i]
		effect["time_left"] = float(effect["time_left"]) - delta
		effect["tick_timer"] = float(effect["tick_timer"]) - delta
		var enemy_id: int = effect["enemy_id"]
		if not _has_enemy_id(enemy_id):
			effects.remove_at(i)
			continue
		while float(effect["tick_timer"]) <= 0.0 and float(effect["time_left"]) > 0.0:
			effect["tick_timer"] = float(effect["tick_timer"]) + float(effect["interval"])
			_apply_damage_to_enemy_id(enemy_id, float(effect["damage"]))
		if float(effect["time_left"]) <= 0.0:
			effects.remove_at(i)
		else:
			effects[i] = effect


func _update_area_ticks(areas: Array[Dictionary], delta: float) -> void:
	for i in range(areas.size() - 1, -1, -1):
		var area: Dictionary = areas[i]
		area["time_left"] = float(area["time_left"]) - delta
		area["tick_timer"] = float(area["tick_timer"]) - delta
		while float(area["tick_timer"]) <= 0.0 and float(area["time_left"]) > 0.0:
			area["tick_timer"] = float(area["tick_timer"]) + float(area["interval"])
			_apply_area_damage(area["pos"], float(area["radius"]), float(area["damage"]))
		if float(area["time_left"]) <= 0.0:
			areas.remove_at(i)
		else:
			areas[i] = area


func _update_swamp_areas(delta: float) -> void:
	for i in range(_swamp_areas.size() - 1, -1, -1):
		var area: Dictionary = _swamp_areas[i]
		area["time_left"] = float(area["time_left"]) - delta
		if float(area["time_left"]) <= 0.0:
			_swamp_areas.remove_at(i)
		else:
			_swamp_areas[i] = area


func _update_earth_walls(delta: float) -> void:
	for i in range(_earth_walls.size() - 1, -1, -1):
		var wall: Dictionary = _earth_walls[i]
		wall["time_left"] = float(wall["time_left"]) - delta
		if float(wall["time_left"]) <= 0.0 or float(wall["hp"]) <= 0.0:
			_earth_walls.remove_at(i)
		else:
			_earth_walls[i] = wall


func _update_clone_lifetime(delta: float) -> void:
	for i in range(_clones.size() - 1, -1, -1):
		var clone: Dictionary = _clones[i]
		clone["time_left"] = float(clone["time_left"]) - delta
		if float(clone["time_left"]) <= 0.0:
			_clones.remove_at(i)
		else:
			_clones[i] = clone


func _apply_area_damage(center: Vector2, radius: float, damage: float) -> void:
	var enemy_ids := _collect_enemy_ids_in_radius(center, radius)
	for enemy_id in enemy_ids:
		_apply_damage_to_enemy_id(enemy_id, damage)


func _collect_enemy_ids_in_radius(center: Vector2, radius: float) -> Array[int]:
	var ids: Array[int] = []
	for enemy in _swarm_enemies:
		if center.distance_to(enemy["pos"]) <= radius:
			ids.append(enemy["id"])
	for enemy in _elite_enemies:
		if center.distance_to(enemy["pos"]) <= radius:
			ids.append(enemy["id"])
	for enemy in _boss_enemies:
		if center.distance_to(enemy["pos"]) <= radius:
			ids.append(enemy["id"])
	return ids


func _apply_knockback(center: Vector2, radius: float, distance_cells: float) -> void:
	var enemy_ids := _collect_enemy_ids_in_radius(center, radius)
	for enemy_id in enemy_ids:
		var loc := _find_enemy_location(enemy_id)
		if loc.is_empty():
			continue
		var group_type: int = loc["group"]
		var index: int = loc["index"]
		var distance_px := distance_cells * SWARM_CELL_Y
		if group_type == 2:
			distance_px *= BOSS_CONTROL_REDUCTION
		if group_type == 0:
			_move_enemy_vertical(_swarm_enemies, index, -distance_px)
		elif group_type == 1:
			_move_enemy_vertical(_elite_enemies, index, -distance_px)
		else:
			_move_enemy_vertical(_boss_enemies, index, -distance_px)


func _move_enemy_vertical(group: Array[Dictionary], index: int, delta_y: float) -> void:
	if index < 0 or index >= group.size():
		return
	var enemy: Dictionary = group[index]
	var pos: Vector2 = enemy["pos"]
	pos.y += delta_y
	pos.y = maxf(pos.y, _enemy_lane_rect.position.y + 8.0)
	enemy["pos"] = pos
	group[index] = enemy


func _apply_damage_to_enemy_id(enemy_id: int, base_damage: float) -> void:
	var loc := _find_enemy_location(enemy_id)
	if loc.is_empty():
		return
	var group_type: int = loc["group"]
	var index: int = loc["index"]
	var group := _group_by_type(group_type)
	var enemy: Dictionary = group[index]
	var pos: Vector2 = enemy["pos"]
	var final_damage := base_damage * _damage_taken_multiplier(pos, group_type)
	_apply_enemy_damage(group, index, final_damage)


func _damage_taken_multiplier(pos: Vector2, group_type: int) -> float:
	var multiplier := 1.0
	for area in _swamp_areas:
		if pos.distance_to(area["pos"]) <= float(area["radius"]):
			var ratio: float = area["armor_break"]
			if group_type == 2:
				ratio *= BOSS_CONTROL_REDUCTION
			multiplier = maxf(multiplier, 1.0 + ratio)
	return multiplier


func _group_by_type(group_type: int) -> Array[Dictionary]:
	if group_type == 0:
		return _swarm_enemies
	if group_type == 1:
		return _elite_enemies
	return _boss_enemies


func _update_enemy_movement(delta: float) -> void:
	if _wave_phase == 0:
		_move_enemy_group(_swarm_enemies, SWARM_FALL_SPEED, delta, 0)
	elif _wave_phase == 1:
		_move_enemy_group(_elite_enemies, ELITE_FALL_SPEED, delta, 1)
	elif _wave_phase == 2:
		_move_enemy_group(_boss_enemies, BOSS_FALL_SPEED, delta, 2)


func _move_enemy_group(group: Array[Dictionary], speed: float, delta: float, group_type: int) -> void:
	for i in range(group.size()):
		var enemy: Dictionary = group[i]
		var pos: Vector2 = enemy["pos"]
		var speed_mul := _enemy_speed_multiplier(pos, group_type)
		var dy := speed * speed_mul * delta
		var next_pos := pos + Vector2(0, dy)
		if _is_blocked_by_earth_wall(next_pos):
			_damage_earth_wall(next_pos, TU_LIU_BI_CONTACT_DPS * delta)
			continue
		pos = next_pos
		enemy["pos"] = pos
		group[i] = enemy


func _enemy_speed_multiplier(pos: Vector2, group_type: int) -> float:
	var multiplier := 1.0
	for area in _swamp_areas:
		if pos.distance_to(area["pos"]) <= float(area["radius"]):
			var slow_ratio: float = area["slow"]
			if group_type == 2:
				slow_ratio *= BOSS_CONTROL_REDUCTION
			multiplier = minf(multiplier, 1.0 - slow_ratio)
	return clampf(multiplier, 0.05, 1.0)


func _is_blocked_by_earth_wall(pos: Vector2) -> bool:
	for wall in _earth_walls:
		var rect: Rect2 = wall["rect"]
		if rect.has_point(pos):
			return true
	return false


func _damage_earth_wall(pos: Vector2, damage: float) -> void:
	for i in range(_earth_walls.size()):
		var wall: Dictionary = _earth_walls[i]
		var rect: Rect2 = wall["rect"]
		if not rect.has_point(pos):
			continue
		wall["hp"] = float(wall["hp"]) - damage
		_earth_walls[i] = wall
		return


func _apply_enemy_damage(group: Array[Dictionary], enemy_index: int, damage: float) -> void:
	var enemy: Dictionary = group[enemy_index]
	var hp: float = float(enemy["hp"])
	var remain_hp := hp - damage
	if remain_hp <= 0.0:
		group.remove_at(enemy_index)
		_on_enemy_killed()
	else:
		enemy["hp"] = remain_hp
		group[enemy_index] = enemy


func _on_enemy_killed() -> void:
	_kill_count += 1
	_try_level_up()


func _try_level_up() -> void:
	while _next_level_idx < _level_kill_requirements.size() and _kill_count >= _level_kill_requirements[_next_level_idx]:
		_hero_level += 1
		_next_level_idx += 1
		_apply_level_upgrade()


func _apply_level_upgrade() -> void:
	var pick := _pick_lowest_upgrade_branch()
	if pick == 0:
		_bullet_count_upgrade += 1
	elif pick == 1:
		_bullet_speed_upgrade += 1
	else:
		_bullet_damage_upgrade += 1
	_upgrade_random_unlocked_skill()


func _upgrade_random_unlocked_skill() -> void:
	if _unlocked_skills.is_empty():
		_last_upgraded_skill = ""
		return
	var idx := _rng.randi_range(0, _unlocked_skills.size() - 1)
	var skill_name := _unlocked_skills[idx]
	var next_level := _skill_level(skill_name) + 1
	_skill_levels[skill_name] = next_level
	_last_upgraded_skill = "%s Lv%d" % [skill_name, next_level]
	_load_skill_values()


func _pick_lowest_upgrade_branch() -> int:
	var min_value := mini(_bullet_count_upgrade, mini(_bullet_speed_upgrade, _bullet_damage_upgrade))
	if _bullet_count_upgrade == min_value:
		return 0
	if _bullet_speed_upgrade == min_value:
		return 1
	return 2


func _find_enemy_location(enemy_id: int) -> Dictionary:
	for i in range(_swarm_enemies.size()):
		if int(_swarm_enemies[i]["id"]) == enemy_id:
			return {"group": 0, "index": i}
	for i in range(_elite_enemies.size()):
		if int(_elite_enemies[i]["id"]) == enemy_id:
			return {"group": 1, "index": i}
	for i in range(_boss_enemies.size()):
		if int(_boss_enemies[i]["id"]) == enemy_id:
			return {"group": 2, "index": i}
	return {}


func _has_enemy_id(enemy_id: int) -> bool:
	return not _find_enemy_location(enemy_id).is_empty()


func _pick_nearest_enemy() -> Dictionary:
	var all := _all_enemies()
	if all.is_empty():
		return {}
	var best: Dictionary = all[0]
	var best_dist := _hero_pos.distance_squared_to(best["pos"])
	for i in range(1, all.size()):
		var cur: Dictionary = all[i]
		var d := _hero_pos.distance_squared_to(cur["pos"])
		if d < best_dist:
			best = cur
			best_dist = d
	return best


func _pick_random_enemy() -> Dictionary:
	var all := _all_enemies()
	if all.is_empty():
		return {}
	return all[_rng.randi_range(0, all.size() - 1)]


func _all_enemies() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for i in range(_swarm_enemies.size()):
		result.append({"group": 0, "index": i, "id": _swarm_enemies[i]["id"], "pos": _swarm_enemies[i]["pos"]})
	for i in range(_elite_enemies.size()):
		result.append({"group": 1, "index": i, "id": _elite_enemies[i]["id"], "pos": _elite_enemies[i]["pos"]})
	for i in range(_boss_enemies.size()):
		result.append({"group": 2, "index": i, "id": _boss_enemies[i]["id"], "pos": _boss_enemies[i]["pos"]})
	return result


func _is_active_skill(skill_name: String) -> bool:
	return skill_name == SKILL_DA_SHOU_LI_JIAN \
		or skill_name == SKILL_YING_FEN_SHEN \
		or skill_name == SKILL_HAO_HUO_QIU \
		or skill_name == SKILL_FENG_XIAN_HUA \
		or skill_name == SKILL_TU_LIU_BI \
		or skill_name == SKILL_HUANG_QUAN_ZHAO


func _has_skill(skill_name: String) -> bool:
	return _unlocked_skills.has(skill_name)


func _cells_to_radius(cells: float) -> float:
	return cells * SWARM_CELL_X


func _check_stage_advance() -> void:
	if _victory:
		return
	if _wave_phase == 0 and _phase_is_cleared():
		_start_elite_for_current_wave()
	elif _wave_phase == 1 and _phase_is_cleared():
		_spawn_next_stage()
	elif _wave_phase == 2 and _phase_is_cleared():
		if _should_hold_for_unlock():
			_start_unlock_opportunity_wave()
		else:
			_handle_level_cleared()


func _spawn_next_stage() -> void:
	if _next_wave_to_spawn <= TOTAL_WAVES:
		_start_wave(_next_wave_to_spawn)
		_next_wave_to_spawn += 1
	else:
		if _should_hold_for_unlock():
			_start_unlock_opportunity_wave()
		else:
			_start_boss()


func _start_wave(wave: int) -> void:
	_active_wave = wave
	var count := maxi(WAVE_BASE_COUNT + (wave - 1) * WAVE_COUNT_STEP, 1)
	var total_hp := WAVE_BASE_HP + float(wave - 1) * WAVE_HP_STEP
	var unit_hp := total_hp / float(count)
	_elite_enemies.clear()
	_boss_enemies.clear()
	_start_phase_spawn(0, count, unit_hp)


func _start_elite_for_current_wave() -> void:
	var total_hp := WAVE_BASE_ELITE_HP + float(_active_wave - 1) * WAVE_ELITE_HP_STEP
	var count := ELITE_COLS * ELITE_ROWS
	var unit_hp := total_hp / float(count)
	_start_phase_spawn(1, count, unit_hp)


func _start_boss() -> void:
	_active_wave = TOTAL_WAVES
	_swarm_enemies.clear()
	_elite_enemies.clear()
	var count := BOSS_COLS * BOSS_ROWS
	var unit_hp := BOSS_MAX_HP / float(count)
	_start_phase_spawn(2, count, unit_hp)


func _is_unlock_target_met() -> bool:
	if not _unlock_focus:
		return true
	return _level_unlock_gain_count >= _unlock_target_count


func _should_hold_for_unlock() -> bool:
	if not _unlock_focus:
		return false
	if _is_unlock_target_met():
		return false
	if _unlock_opportunity_remaining <= 0:
		return false
	return not _available_skill_pool.is_empty()


func _start_unlock_opportunity_wave() -> void:
	_unlock_opportunity_remaining = maxi(_unlock_opportunity_remaining - 1, 0)
	_active_wave = TOTAL_WAVES
	var count := maxi(int(round(float(WAVE_BASE_COUNT) * 0.7)), 6)
	var total_hp := WAVE_BASE_HP + float(maxi(TOTAL_WAVES - 1, 0)) * WAVE_HP_STEP
	var unit_hp := total_hp / float(count)
	_elite_enemies.clear()
	_boss_enemies.clear()
	_start_phase_spawn(0, count, unit_hp)


func _start_phase_spawn(phase: int, count: int, unit_hp: float) -> void:
	_wave_phase = phase
	_phase_spawn_left = count
	_phase_spawn_unit_hp = unit_hp
	_phase_spawn_timer = 0.0
	if phase == 0:
		_swarm_enemies.clear()
	elif phase == 1:
		_elite_enemies.clear()
	else:
		_boss_enemies.clear()


func _phase_is_cleared() -> bool:
	if _phase_spawn_left > 0:
		return false
	if _wave_phase == 0:
		return _swarm_enemies.is_empty()
	if _wave_phase == 1:
		return _elite_enemies.is_empty()
	return _boss_enemies.is_empty()


func _update_enemy_spawn(delta: float) -> void:
	if _phase_spawn_left <= 0:
		return
	_phase_spawn_timer += delta
	var interval := _phase_spawn_interval()
	while _phase_spawn_timer >= interval and _phase_spawn_left > 0:
		_phase_spawn_timer -= interval
		_spawn_enemy_for_phase(_wave_phase, _phase_spawn_unit_hp)
		_phase_spawn_left -= 1


func _phase_spawn_interval() -> float:
	if _wave_phase == 0:
		return SWARM_SPAWN_INTERVAL
	if _wave_phase == 1:
		return ELITE_SPAWN_INTERVAL
	return ELITE_SPAWN_INTERVAL


func _spawn_enemy_for_phase(phase: int, unit_hp: float) -> void:
	var spawn_pos := _random_enemy_spawn_position(phase)
	var enemy := {"id": _alloc_enemy_id(), "pos": spawn_pos, "hp": unit_hp}
	if phase == 0:
		_swarm_enemies.append(enemy)
	elif phase == 1:
		_elite_enemies.append(enemy)
	else:
		_boss_enemies.append(enemy)


func _random_enemy_spawn_position(phase: int) -> Vector2:
	var radius := SWARM_DOT_RADIUS
	if phase == 1:
		radius = ELITE_DOT_RADIUS
	elif phase == 2:
		radius = BOSS_DOT_RADIUS
	var min_x := _enemy_lane_rect.position.x + radius + 2.0
	var max_x := _enemy_lane_rect.end.x - radius - 2.0
	var x := _rng.randf_range(min_x, max_x)
	var y := _enemy_lane_rect.position.y + radius + 4.0
	return Vector2(x, y)


func _build_grid_group(
	count: int,
	cols: int,
	cell_x: float,
	cell_y: float,
	unit_hp: float,
	center_x: float,
	top_y: float
) -> Array[Dictionary]:
	var width := float(cols - 1) * cell_x
	var enemies: Array[Dictionary] = []
	for i in range(count):
		var row := i / cols
		var col := i % cols
		var pos := Vector2(center_x - width * 0.5 + float(col) * cell_x, top_y + float(row) * cell_y)
		enemies.append({"id": _alloc_enemy_id(), "pos": pos, "hp": unit_hp})
	return enemies


func _alloc_enemy_id() -> int:
	var id := _next_enemy_id
	_next_enemy_id += 1
	return id


func _check_enemy_touch_hero() -> void:
	var hero_radius := HERO_SIZE.x * 0.5
	for enemy in _active_enemy_group():
		var pos: Vector2 = enemy["pos"]
		if pos.distance_to(_hero_pos) <= hero_radius + _active_enemy_radius():
			_trigger_game_over()
			return


func _check_enemy_reach_hero_line() -> void:
	var hero_line_y := _hero_pos.y
	for enemy in _active_enemy_group():
		var pos: Vector2 = enemy["pos"]
		if pos.y + _active_enemy_radius() >= hero_line_y:
			_trigger_game_over()
			return


func _active_enemy_group() -> Array[Dictionary]:
	if _wave_phase == 0:
		return _swarm_enemies
	if _wave_phase == 1:
		return _elite_enemies
	return _boss_enemies


func _active_enemy_radius() -> float:
	if _wave_phase == 0:
		return SWARM_DOT_RADIUS
	if _wave_phase == 1:
		return ELITE_DOT_RADIUS
	return BOSS_DOT_RADIUS


func _trigger_game_over() -> void:
	if _game_over:
		return
	_game_over = true
	LevelProgress.record_level_fail(level_id)
	_move_left_pressed = false
	_move_right_pressed = false
	_projectiles.clear()
	_clones.clear()
	_poison_effects.clear()
	_shuriken_areas.clear()
	_burn_areas.clear()
	_swamp_areas.clear()
	_earth_walls.clear()
	game_over_popup.visible = true


func _handle_level_cleared() -> void:
	if _level_cleared_handled:
		return
	_level_cleared_handled = true
	_victory = true
	LevelProgress.clear_level_fail(level_id)
	_move_left_pressed = false
	_move_right_pressed = false
	_projectiles.clear()
	LevelProgress.complete_level(level_id)
	victory_popup.visible = true


func _to_multiple_of_ten(v: int) -> int:
	var n: int = maxi(v, SWARM_COLS)
	var rem: int = n % SWARM_COLS
	if rem == 0:
		return n
	return n + (SWARM_COLS - rem)


func _get_enemy_lane_center_x() -> float:
	return _enemy_lane_rect.get_center().x


func _recenter_enemy_groups_x() -> void:
	var center_x := _get_enemy_lane_center_x()
	_recenter_group(_swarm_enemies, center_x)
	_recenter_group(_elite_enemies, center_x)
	_recenter_group(_boss_enemies, center_x)


func _recenter_group(group: Array[Dictionary], center_x: float) -> void:
	if group.is_empty():
		return
	var old_center := _group_center(group).x
	var dx := center_x - old_center
	if is_zero_approx(dx):
		return
	for i in range(group.size()):
		var enemy: Dictionary = group[i]
		var pos: Vector2 = enemy["pos"]
		pos.x += dx
		enemy["pos"] = pos
		group[i] = enemy


func _group_center(group: Array[Dictionary]) -> Vector2:
	if group.is_empty():
		return _enemy_lane_rect.get_center()
	var min_x := INF
	var min_y := INF
	var max_x := -INF
	var max_y := -INF
	for enemy in group:
		var pos: Vector2 = enemy["pos"]
		min_x = minf(min_x, pos.x)
		min_y = minf(min_y, pos.y)
		max_x = maxf(max_x, pos.x)
		max_y = maxf(max_y, pos.y)
	return Vector2((min_x + max_x) * 0.5, (min_y + max_y) * 0.5)


func _group_hp_sum(group: Array[Dictionary]) -> float:
	var hp := 0.0
	for enemy in group:
		hp += float(enemy["hp"])
	return hp


func _get_skill_grid_bounds() -> Rect2:
	var width := float(SKILL_GRID_COLS - 1) * SKILL_CELL_X + SKILL_DOT_RADIUS * 2.0
	var height := float(SKILL_GRID_ROWS - 1) * SKILL_CELL_Y + SKILL_DOT_RADIUS * 2.0
	var x := _skill_lane_rect.get_center().x - width * 0.5
	var y := _wall_rect.end.y - height
	y = maxf(y, _skill_lane_rect.position.y + 6.0)
	return Rect2(Vector2(x, y), Vector2(width, height))


func _update_top_info() -> void:
	var phase_suffix := ""
	if _phase_spawn_left > 0:
		phase_suffix = "（待刷:%d）" % [_phase_spawn_left]
	if _game_over:
		top_info.text = "游戏结束：敌人触碰主角或到达主角水平线"
	elif _victory:
		top_info.text = "通关：Boss 已击败"
	elif _wave_phase == 0:
		top_info.text = "第 %d / %d 波：普通敌人%s" % [_active_wave, TOTAL_WAVES, phase_suffix]
	elif _wave_phase == 1:
		top_info.text = "第 %d / %d 波：精英怪%s" % [_active_wave, TOTAL_WAVES, phase_suffix]
	else:
		top_info.text = "最终Boss战%s" % [phase_suffix]
	if _unlock_focus and not _game_over and not _victory:
		top_info.text = "%s  解锁进度:%d/%d" % [top_info.text, _level_unlock_gain_count, _unlock_target_count]
	swarm_hp_label.visible = _wave_phase == 1 or _wave_phase == 2
	if swarm_hp_label.visible:
		swarm_hp_label.text = "%.0f" % [_group_hp_sum(_active_enemy_group())]
	_update_skill_drop_label()
	_update_skill_pool_indicator()
	_update_enemy_indicator_position()


func _update_skill_drop_label() -> void:
	var skill_text := "暂无"
	if not _last_unlocked_skill.is_empty():
		skill_text = _last_unlocked_skill
	var unlocked_text := "无"
	if not _unlocked_skills.is_empty():
		unlocked_text = "、".join(_unlocked_skills)
	var upgraded_text := "无"
	if not _last_upgraded_skill.is_empty():
		upgraded_text = _last_upgraded_skill
	var focus_text := "普通模式"
	if _unlock_focus:
		focus_text = "前5关解锁: %d/%d  机会:%d" % [_level_unlock_gain_count, _unlock_target_count, _unlock_opportunity_remaining]
	var assist_text := "无"
	if _assist_step > 0:
		assist_text = "失败补偿 Lv%d" % _assist_step
	skill_drop_label.text = "宝箱技能: %s\n已解锁: %d  技能: %s\n技能升级: %s\n%s  补偿:%s\n等级: Lv%d  击杀: %d/%d\n子弹: 数量+%d  速度+%d%%  伤害+%d%%" % [
		skill_text,
		_unlocked_skill_count,
		unlocked_text,
		upgraded_text,
		focus_text,
		assist_text,
		_hero_level,
		_kill_count,
		_next_level_target(),
		_bullet_count_upgrade,
		int(_bullet_speed_upgrade * _bullet_speed_per_upgrade * 100.0),
		int(_bullet_damage_upgrade * _bullet_damage_per_upgrade * 100.0)
	]


func _next_level_target() -> int:
	if _next_level_idx >= _level_kill_requirements.size():
		return _kill_count
	return _level_kill_requirements[_next_level_idx]


func _update_enemy_indicator_position() -> void:
	if not swarm_hp_label.visible:
		return
	var active_group := _active_enemy_group()
	if active_group.is_empty():
		return
	var center := _group_center(active_group)
	var label_w := _enemy_lane_rect.size.x + 24.0
	var left := center.x - label_w * 0.5
	var top := center.y - 46.0
	swarm_hp_label.offset_left = left
	swarm_hp_label.offset_top = top
	swarm_hp_label.offset_right = left + label_w
	swarm_hp_label.offset_bottom = top + 30.0


func _update_skill_pool_indicator() -> void:
	skill_pool_hp_label.text = str(maxi(int(ceil(_skill_pool_hp)), 0))
	_update_skill_pool_indicator_position()


func _update_skill_pool_indicator_position() -> void:
	var bounds := _get_skill_grid_bounds()
	var label_width := 120.0
	var label_height := 42.0
	var left := bounds.get_center().x - label_width * 0.5
	var top := bounds.position.y - label_height - 10.0
	skill_pool_hp_label.offset_left = left
	skill_pool_hp_label.offset_top = top
	skill_pool_hp_label.offset_right = left + label_width
	skill_pool_hp_label.offset_bottom = top + label_height
	skill_pool_hp_label.visible = true


func _move_hero_to_x(target_x: float) -> void:
	var min_x := _play_rect.position.x + 34.0
	var max_x := _play_rect.end.x - 34.0
	_hero_pos.x = clampf(target_x, min_x, max_x)


func _on_move_left_down() -> void:
	_move_left_pressed = true


func _on_move_left_up() -> void:
	_move_left_pressed = false


func _on_move_right_down() -> void:
	_move_right_pressed = true


func _on_move_right_up() -> void:
	_move_right_pressed = false


func _on_restart_pressed() -> void:
	get_tree().reload_current_scene()


func _on_next_level_pressed() -> void:
	if not next_level_scene_path.is_empty() and ResourceLoader.exists(next_level_scene_path):
		get_tree().change_scene_to_file(next_level_scene_path)
		return
	get_tree().change_scene_to_file("res://scenes/main/level_select.tscn")


func _on_select_level_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/main/level_select.tscn")
