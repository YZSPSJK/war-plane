extends RefCounted
class_name LevelProgress

const LevelCatalog = preload("res://scripts/config/level_catalog.gd")

const SAVE_PATH := "user://level_progress.cfg"


static func has_progress() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var cfg := _load_cfg()
	return cfg.has_section_key("progress", "unlocked_level_index")


static func _load_cfg() -> ConfigFile:
	var cfg := ConfigFile.new()
	cfg.load(SAVE_PATH)
	return cfg


static func _save_cfg(cfg: ConfigFile) -> void:
	cfg.save(SAVE_PATH)


static func get_unlocked_level_index() -> int:
	var level_order := LevelCatalog.level_order()
	var cfg := _load_cfg()
	var idx := int(cfg.get_value("progress", "unlocked_level_index", 0))
	return clampi(idx, 0, level_order.size() - 1)


static func is_level_unlocked(level_id: String) -> bool:
	var level_order := LevelCatalog.level_order()
	var idx := level_order.find(level_id)
	if idx == -1:
		return false
	return idx <= get_unlocked_level_index()


static func complete_level(level_id: String) -> void:
	var level_order := LevelCatalog.level_order()
	var idx := level_order.find(level_id)
	if idx == -1:
		return
	var unlocked_idx := get_unlocked_level_index()
	var next_unlock := mini(idx + 1, level_order.size() - 1)
	var target_idx := maxi(unlocked_idx, next_unlock)
	var cfg := _load_cfg()
	cfg.set_value("progress", "unlocked_level_index", target_idx)
	_save_cfg(cfg)


static func get_global_unlocked_skills(skill_pool: Array[String]) -> Array[String]:
	var cfg := _load_cfg()
	var raw = cfg.get_value("progress", "unlocked_skills_global", [])
	var unlocked: Array[String] = []
	for item in raw:
		var name := str(item)
		if skill_pool.has(name) and not unlocked.has(name):
			unlocked.append(name)
	return unlocked


static func get_skill_unlock_cursor(skill_pool: Array[String]) -> int:
	var unlocked := get_global_unlocked_skills(skill_pool)
	return clampi(unlocked.size(), 0, skill_pool.size())


static func can_unlock_next_skill(skill_name: String, skill_pool: Array[String]) -> bool:
	var cursor := get_skill_unlock_cursor(skill_pool)
	if cursor >= skill_pool.size():
		return false
	return skill_pool[cursor] == skill_name


static func commit_skill_unlock(skill_name: String, skill_pool: Array[String]) -> bool:
	if skill_pool.is_empty():
		return false
	var cursor := get_skill_unlock_cursor(skill_pool)
	if cursor >= skill_pool.size():
		return false
	if skill_pool[cursor] != skill_name:
		return false
	var unlocked := get_global_unlocked_skills(skill_pool)
	unlocked.append(skill_name)
	var cfg := _load_cfg()
	cfg.set_value("progress", "unlocked_skills_global", unlocked)
	cfg.set_value("progress", "skill_unlock_cursor", unlocked.size())
	_save_cfg(cfg)
	return true


static func get_level_fail_streak(level_id: String) -> int:
	var cfg := _load_cfg()
	var key := "%s_fail_streak" % level_id
	return maxi(int(cfg.get_value("progress", key, 0)), 0)


static func record_level_fail(level_id: String) -> int:
	var cfg := _load_cfg()
	var key := "%s_fail_streak" % level_id
	var next_value := maxi(int(cfg.get_value("progress", key, 0)) + 1, 1)
	cfg.set_value("progress", key, next_value)
	_save_cfg(cfg)
	return next_value


static func clear_level_fail(level_id: String) -> void:
	var cfg := _load_cfg()
	var key := "%s_fail_streak" % level_id
	cfg.set_value("progress", key, 0)
	_save_cfg(cfg)


static func reset_all_progress() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)
