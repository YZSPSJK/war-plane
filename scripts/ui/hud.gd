extends Control

@onready var state_label: Label = $StateLabel


func _ready() -> void:
	GameManager.state_changed.connect(_on_state_changed)
	_on_state_changed(GameManager.get_state_name())


func _exit_tree() -> void:
	if GameManager.state_changed.is_connected(_on_state_changed):
		GameManager.state_changed.disconnect(_on_state_changed)


func _on_state_changed(state_name: String) -> void:
	state_label.text = "State: %s" % state_name
