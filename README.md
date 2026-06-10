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

## 第一关原型（无素材版）

- 蓝色方块：主角（可左右移动）
- 黑色圆点：主角按固定频率抛出的武器
- 红色小圆点：普通敌人（显示总血量，不显示单体血条）
- 红色中方块：精英怪（每波 1 个，随波次下压）
- 红色大圆点：Boss（第 5 波后出现）
- 左侧橙色方块：待解锁技能（带血条）

交互规则：

- 左侧为 `10x10` 橙色矩阵（总血池语义）：命中左侧时仅扣统一技能血量，归零后重置并累积解锁次数。
- 主角子弹固定频率向前发射；单发子弹只参与一次结算，命中后即消失。
- 命中先按墙分侧：左侧判技能，右侧判敌人。
- 右侧敌人矩阵：普通敌人 `10xn`（数量恒为 10 的倍数）、精英 `4x4`、Boss `6x6`。
- 右侧命中顺序：`x` 左到右，若同列则 `y` 下到上；按该顺序选中唯一目标结算。
- 伤害结算：设怪物血量 `A`、子弹伤害 `B`，`A<=B` 则怪物移除；`A>B` 则怪物变为 `A-B`。
- 敌人分 5 波按阶段推进：普通 -> 精英 -> 下一波 ... -> Boss；阶段互斥，不重叠。
- 敌人触碰主角或下压到主角水平线，均判定游戏结束。
- 右侧血量文字红色显示，浮动在当前活动敌人上方，仅显示当前数值。

判定规范文档：

- `docs/combat-hit-logic.md`

布局说明（移动端）：

- 默认采用竖屏比例（`720x1280`）。
- 中间是道路与墙体，用于分隔左右区域。
- 左侧为技能块区域，右侧为小怪区域，主角位于底部左右移动。
