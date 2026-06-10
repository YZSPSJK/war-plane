extends Node3D

@onready var camera_pivot: Node3D = $CameraPivot

const ROTATE_SPEED := 0.004


func _ready() -> void:
	InputService.drag.connect(_on_drag)
	InputService.double_tap.connect(_on_double_tap)


func _exit_tree() -> void:
	if InputService.drag.is_connected(_on_drag):
		InputService.drag.disconnect(_on_drag)
	if InputService.double_tap.is_connected(_on_double_tap):
		InputService.double_tap.disconnect(_on_double_tap)


func _on_drag(delta: Vector2) -> void:
	if not GameManager.is_playing():
		return
	rotate_y(-delta.x * ROTATE_SPEED)
	camera_pivot.rotate_x(-delta.y * ROTATE_SPEED)
	camera_pivot.rotation.x = clamp(camera_pivot.rotation.x, deg_to_rad(-70), deg_to_rad(-10))


func _on_double_tap(_position: Vector2) -> void:
	if GameManager.is_playing():
		GameManager.toggle_pause()
	else:
		GameManager.start_game()
