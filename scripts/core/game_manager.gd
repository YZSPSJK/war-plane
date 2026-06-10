extends Node

signal state_changed(state_name: String)

enum GameState {
	BOOT,
	MENU,
	PLAYING,
	PAUSED
}

var _state: GameState = GameState.BOOT


func bootstrap() -> void:
	_set_state(GameState.MENU)


func start_game() -> void:
	get_tree().paused = false
	_set_state(GameState.PLAYING)


func toggle_pause() -> void:
	if _state == GameState.PLAYING:
		get_tree().paused = true
		_set_state(GameState.PAUSED)
	elif _state == GameState.PAUSED:
		get_tree().paused = false
		_set_state(GameState.PLAYING)


func is_playing() -> bool:
	return _state == GameState.PLAYING


func get_state_name() -> String:
	return GameState.keys()[_state]


func _set_state(next_state: GameState) -> void:
	if _state == next_state:
		return
	_state = next_state
	state_changed.emit(get_state_name())
