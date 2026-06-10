extends Node

const LevelProgress = preload("res://scripts/core/level_progress.gd")

@export var game_scene: PackedScene

var _game_instance: Node


func _ready() -> void:
	var first_scene := "res://scenes/levels/level_experience.tscn"
	var menu_scene := "res://scenes/main/level_select.tscn"
	var entry_scene := menu_scene if LevelProgress.has_progress() else first_scene
	var packed := load(entry_scene) as PackedScene
	if packed == null:
		if game_scene == null:
			push_error("AppRoot: game_scene 未配置")
			return
		packed = game_scene
	_game_instance = packed.instantiate()
	add_child(_game_instance)
	GameManager.bootstrap()
