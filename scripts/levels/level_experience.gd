extends "res://scripts/levels/level1.gd"

var _rescue_chest_falling := false
var _rescue_chest_pos := Vector2.ZERO
var _rescue_chest_target := Vector2.ZERO
var _rescue_chest_speed := 880.0
var _experience_notice := ""
var _boss_started := false


func _load_balance_config() -> void:
	super._load_balance_config()
	SKILL_POOL_MAX_HP = 999999.0
	_skill_pool_hp = SKILL_POOL_MAX_HP


func _ready() -> void:
	level_id = "level2_experience"
	next_level_scene_path = "res://scenes/levels/level1.tscn"
	super._ready()


func _process(delta: float) -> void:
	super._process(delta)
	_update_rescue_chest_drop(delta)


func _draw() -> void:
	super._draw()
	if not _rescue_chest_falling:
		return
	var box := Rect2(_rescue_chest_pos - Vector2(20, 16), Vector2(40, 32))
	draw_rect(box, Color(0.96, 0.70, 0.16), true)
	draw_rect(box, Color(0.45, 0.22, 0.05), false, 2.0)


func _spawn_enemy_for_phase(phase: int, unit_hp: float) -> void:
	super._spawn_enemy_for_phase(phase, unit_hp * 3.0)


func _spawn_next_stage() -> void:
	if _available_skill_pool.is_empty():
		if not _boss_started:
			_boss_started = true
			_start_boss()
		return
	if _next_wave_to_spawn <= TOTAL_WAVES:
		_start_wave(_next_wave_to_spawn)
		_next_wave_to_spawn += 1
	else:
		_next_wave_to_spawn = 1
		_start_wave(_next_wave_to_spawn)
		_next_wave_to_spawn += 1


func _check_enemy_touch_hero() -> void:
	var hero_radius := HERO_SIZE.x * 0.5
	for enemy in _active_enemy_group():
		var pos: Vector2 = enemy["pos"]
		if pos.distance_to(_hero_pos) <= hero_radius + _active_enemy_radius():
			_try_drop_rescue_chest()
			_push_back_active_enemies()
			return


func _check_enemy_reach_hero_line() -> void:
	var warning_line := _hero_pos.y - 30.0
	for enemy in _active_enemy_group():
		var pos: Vector2 = enemy["pos"]
		if pos.y + _active_enemy_radius() >= warning_line:
			_try_drop_rescue_chest()
			_push_back_active_enemies()
			return


func _unlock_random_skill() -> void:
	var before_unlock_count := _unlocked_skills.size()
	super._unlock_random_skill()
	if _unlocked_skills.size() == before_unlock_count:
		return
	_cast_shinra_tensei()
	if _available_skill_pool.is_empty():
		_spawn_next_stage()


func _cast_shinra_tensei() -> void:
	var killed := _swarm_enemies.size() + _elite_enemies.size() + _boss_enemies.size()
	_swarm_enemies.clear()
	_elite_enemies.clear()
	_boss_enemies.clear()
	_phase_spawn_left = 0
	_experience_notice = "神罗天征"
	_last_unlocked_skill = "%s（神罗天征）" % _last_unlocked_skill
	for _i in range(killed):
		_on_enemy_killed()


func _update_top_info() -> void:
	super._update_top_info()
	if not _experience_notice.is_empty() and not _game_over and not _victory:
		top_info.text = "%s：右侧敌人已清场" % _experience_notice
		_experience_notice = ""


func _push_back_active_enemies() -> void:
	var group := _active_enemy_group()
	for i in range(group.size()):
		_move_enemy_vertical(group, i, -32.0)


func _try_drop_rescue_chest() -> void:
	if _rescue_chest_falling:
		return
	if _available_skill_pool.is_empty():
		return
	_rescue_chest_falling = true
	_rescue_chest_pos = Vector2(_play_rect.get_center().x, _play_rect.position.y - 40.0)
	_rescue_chest_target = _get_skill_grid_bounds().get_center()


func _update_rescue_chest_drop(delta: float) -> void:
	if not _rescue_chest_falling:
		return
	var to_target := _rescue_chest_target - _rescue_chest_pos
	var distance := to_target.length()
	var step := _rescue_chest_speed * delta
	if distance <= step:
		_rescue_chest_pos = _rescue_chest_target
		_rescue_chest_falling = false
		_unlock_random_skill()
	else:
		_rescue_chest_pos += to_target.normalized() * step
