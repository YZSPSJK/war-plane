extends Node

signal tap(position: Vector2)
signal drag(delta: Vector2)
signal double_tap(position: Vector2)

var _touch_count: int = 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		_handle_touch(event)
	elif event is InputEventScreenDrag:
		drag.emit(event.relative)


func _handle_touch(event: InputEventScreenTouch) -> void:
	if event.pressed:
		_touch_count += 1
		if event.double_tap:
			double_tap.emit(event.position)
		else:
			tap.emit(event.position)
	else:
		_touch_count = max(_touch_count - 1, 0)
