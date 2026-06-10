# Tower Defense Mobile Starter (Godot 4)

这是一个面向新手的 2.5D 移动端塔防项目初始化骨架，目标是先把“接口层和工程结构”搭好，再逐步填充玩法。

## 已初始化内容

- Godot 4 工程文件：`project.godot`
- 主入口场景：`scenes/main/main.tscn`
- 游戏根场景：`scenes/game/game_root.tscn`
- 全局单例：
  - `GameManager`（状态机接口）
  - `InputService`（触控输入接口）
- UI 状态展示：`scripts/ui/hud.gd`

## 目录结构

```text
assets/
  icon.svg
scenes/
  levels/level1.tscn
  main/main.tscn
  game/game_root.tscn
scripts/
  core/
    app_root.gd
    game_manager.gd
    input_service.gd
  game/
    game_root.gd
  levels/
    level1.gd
  ui/
    hud.gd
project.godot
```

## 当前接口约定

- `GameManager.bootstrap()`：初始化状态为 `MENU`
- `GameManager.start_game()`：进入 `PLAYING`
- `GameManager.toggle_pause()`：`PLAYING` 与 `PAUSED` 互切
- `GameManager.state_changed(state_name)`：状态变更信号

- `InputService.tap(position)`：单击事件
- `InputService.double_tap(position)`：双击事件（当前用于开始/暂停）
- `InputService.drag(delta)`：拖拽事件（当前用于旋转镜头）

## 如何运行

1. 打开 Godot 4。
2. 选择 `Import`，导入当前目录下的 `project.godot`。
3. 运行项目，移动端或桌面模拟都可看到基础场景。

## 下一步建议

1. 加入“格子地图接口”（MapGridService）和“建塔接口”（TowerPlacementService）。
2. 定义“敌人波次接口”（WaveService），将刷怪逻辑从场景脚本中剥离。
3. 增加资源配置文件（如塔属性、敌人属性）并统一读取。

## 玩法与协作文档

玩法核心、技能规则、命中判定和关卡构造已统一迁移到 `.harness/docs/`：

- `.harness/docs/gameplay-core.md`
- `.harness/docs/combat-hit-logic.md`
- `.harness/docs/skills.md`
- `.harness/docs/level-construction.md`

Agent 入口索引与移动端样式布局说明见：`AGENTS.md`。
