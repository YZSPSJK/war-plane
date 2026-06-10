extends Control

const LevelProgress = preload("res://scripts/core/level_progress.gd")

@onready var level1_button: Button = $Panel/VBox/Level1Button
@onready var level2_button: Button = $Panel/VBox/Level2Button
@onready var level3_button: Button = $Panel/VBox/Level3Button
@onready var level4_button: Button = $Panel/VBox/Level4Button
@onready var level5_button: Button = $Panel/VBox/Level5Button
@onready var desc_label: Label = $Panel/VBox/DescLabel
@onready var reset_progress_button: Button = $Panel/VBox/ResetProgressButton


func _ready() -> void:
	level1_button.pressed.connect(_on_level1_pressed)
	level2_button.pressed.connect(_on_level2_pressed)
	level3_button.pressed.connect(_on_level3_pressed)
	level4_button.pressed.connect(_on_level4_pressed)
	level5_button.pressed.connect(_on_level5_pressed)
	reset_progress_button.pressed.connect(_on_reset_progress_pressed)
	var box: VBoxContainer = $Panel/VBox
	box.move_child(level2_button, 1)
	box.move_child(level1_button, 2)
	_refresh_unlock_state()


func _refresh_unlock_state() -> void:
	level2_button.disabled = false
	level1_button.disabled = false
	level3_button.disabled = not LevelProgress.is_level_unlocked("level3")
	level4_button.disabled = not LevelProgress.is_level_unlocked("level4")
	level5_button.disabled = not LevelProgress.is_level_unlocked("level5")
	if level3_button.disabled:
		desc_label.text = "通关第一关后解锁第三关"
	elif level4_button.disabled:
		desc_label.text = "通关第三关后解锁第四关"
	elif level5_button.disabled:
		desc_label.text = "通关第四关后解锁第五关"
	else:
		desc_label.text = "前5关均已解锁"


func _on_level1_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/levels/level1.tscn")


func _on_level2_pressed() -> void:
	if level2_button.disabled:
		return
	get_tree().change_scene_to_file("res://scenes/levels/level_experience.tscn")


func _on_level3_pressed() -> void:
	if level3_button.disabled:
		return
	get_tree().change_scene_to_file("res://scenes/levels/level3.tscn")


func _on_level4_pressed() -> void:
	if level4_button.disabled:
		return
	get_tree().change_scene_to_file("res://scenes/levels/level4.tscn")


func _on_level5_pressed() -> void:
	if level5_button.disabled:
		return
	get_tree().change_scene_to_file("res://scenes/levels/level5.tscn")


func _on_reset_progress_pressed() -> void:
	LevelProgress.reset_all_progress()
	_refresh_unlock_state()
	desc_label.text = "进度已重置，从体验关重新开始"
