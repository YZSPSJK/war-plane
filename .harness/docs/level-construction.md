# 关卡构造文档

## 事实来源

- H5 入口与关卡运行时：`index.html`、`web/game.js`
- 关卡目录与配置：`scripts/config/level_catalog.gd`
- 关卡选择界面：`scripts/main/level_select.gd`
- 基础关卡脚本：`scripts/levels/level1.gd`
- 体验关扩展脚本：`scripts/levels/level_experience.gd`
- 进度存档：`scripts/core/level_progress.gd`
- 关卡场景：`scenes/levels/*.tscn`

当前可运行入口为 H5。Godot 场景关系仍记录旧实现状态；H5 关卡顺序与配置在 `web/game.js` 中维护。

## 当前关卡顺序

`LevelCatalog.LEVEL_ORDER` 当前顺序：

1. `level2_experience`
2. `level1`
3. `level3`
4. `level4`
5. `level5`
6. `endless`

`FIRST_FIVE_LEVELS` 包含：

- `level2_experience`
- `level1`
- `level3`
- `level4`
- `level5`

这些关卡在 Godot 旧实现中启用前 5 关技能解锁目标。H5 当前不使用关卡解锁目标，也不使用额外任务技能；成长由宝箱奖励和基础弹幕升级驱动。

## 场景与脚本关系

- `scenes/levels/level_experience.tscn`：当前挂载 `scripts/levels/level1.gd`，未挂载 `level_experience.gd`，也未设置 `level_id = "level2_experience"`。
- `scenes/levels/level1.tscn`：`level_id = "level1"`，下一关为 `level3.tscn`。
- `scenes/levels/level3.tscn`：`level_id = "level3"`，下一关为 `level4.tscn`。
- `scenes/levels/level4.tscn`：`level_id = "level4"`，下一关为 `level5.tscn`。
- `scenes/levels/level5.tscn`：`level_id = "level5"`，当前未设置下一关场景。

关卡 1、3、4、5 复用 `level1.gd`，差异主要来自 `level_id` 对应的 `LevelCatalog.LEVEL_CONFIGS`。
`scripts/levels/level_experience.gd` 已定义体验关扩展逻辑，但当前没有被任何场景引用；接入前不要把救援宝箱和“神罗天征”视为已生效玩法。

## 关卡选择与解锁

- 体验关和第一关默认可进。
- 第三关需要通关第一关。
- 第四关需要通关第三关。
- 第五关需要通关第四关。
- 通关时由 `LevelProgress.complete_level(level_id)` 推进 `unlocked_level_index`。
- 重置按钮调用 `LevelProgress.reset_all_progress()` 清除本地进度。

H5 版本使用 `localStorage.neonTowerProgress` 保存关卡进度、金币、抽奖券、角色预留数据、战机拥有状态和战机升级状态，当前通关弹窗提供“下一关”入口。

H5 当前存档字段：

- `unlockedLevelIndex`：已解锁关卡索引。
- `coins`：死亡或通关结算金币。
- `drawTickets`：通关获得的抽奖券预留字段，当前战机信息页不提供抽奖入口。
- `selectedCharacter`：当前选中角色，默认 `neon_vanguard`。
- `selectedFighter`：当前选中战机，默认 `basic_fighter`。
- `characters`：角色拥有、等级和碎片预留结构。
- `fighters`：战机拥有状态，基础战机默认拥有。
- `fighterUpgrades`：战机基础参数、命中技能等级和击败技能解锁状态。

## 关卡配置字段

Godot 每个关卡配置包含：

- `unlock_focus`：是否要求本关推进技能解锁。
- `unlock_target_count_min` / `unlock_target_count_max`：本关需要获得的技能数量范围。
- `unlock_gate_mode`：当前使用 `sequential` 或 `none`。
- `unlock_opportunity_count`：Boss 前或 Boss 后允许追加的解锁机会波数量。
- `difficulty_band`：压力区间与敌人缩放。
- `assist_rules`：连续失败后的动态辅助。

## 当前配置摘要

H5 当前只使用关卡 `hp`、`speed`、`spawn` 三个缩放字段，关卡顺序与 Godot 保持一致。怪物基础刷怪节奏维护在 `web/config.js`：普通怪间隔 `0.54` 秒，精英怪间隔 `0.78` 秒，各关再通过 `spawn` 缩放提高或放松频率。普通/精英生成队列会连续追加下一波，不等待屏幕清空；Boss 仍等待前置敌人清空后登场。

Godot 旧配置摘要：

| 关卡 | 解锁目标 | 机会波 | HP缩放 | 速度缩放 | 刷怪缩放 |
| --- | --- | ---: | ---: | ---: | ---: |
| `level2_experience` | 固定 2 | 18 | 0.95 | 0.96 | 1.03 |
| `level1` | 1 到 2 | 14 | 1.00 | 1.00 | 1.00 |
| `level3` | 1 到 2 | 16 | 1.08 | 1.04 | 1.03 |
| `level4` | 1 到 2 | 16 | 1.14 | 1.06 | 1.04 |
| `level5` | 1 到 2 | 16 | 1.20 | 1.08 | 1.05 |
| `endless` | 无 | 0 | 1.32 | 1.14 | 1.08 |

所有前 5 关当前都启用失败辅助：

- `fail_threshold = 2`
- `max_steps = 2`
- 每步 HP 降低 `6%`
- 每步速度降低 `4%`
- 每步刷怪压力放松 `6%`

## 体验关特殊规则

以下规则来自 `scripts/levels/level_experience.gd`，当前属于已实现但未挂载到 `level_experience.tscn` 的扩展逻辑：

- `level_id = "level2_experience"`。
- 下一关指向 `scenes/levels/level1.tscn`。
- 技能池血量被设置为极高值，正常左侧扣血不作为主要解锁方式。
- 敌人生成血量乘以 `3.0`。
- 当敌人触碰主角或到达警戒线时，不直接失败；改为尝试掉落救援宝箱并推回当前敌人。
- 救援宝箱落到技能格后解锁技能。
- 每次成功解锁技能后触发“神罗天征”清场。

## 新增关卡流程

1. 新增或复制关卡场景，并设置正确的 `level_id` 与 `next_level_scene_path`。
2. 在 `LevelCatalog.LEVEL_ORDER` 中加入关卡 ID。
3. 如属于前 5 关技能解锁链，加入 `FIRST_FIVE_LEVELS` 并补齐 `LEVEL_CONFIGS`。
4. 在 `level_select.gd` 与对应场景中加入入口、按钮状态和解锁文案。
5. 确认 `LevelProgress.complete_level()` 能按新顺序推进。
6. 验证通关、失败、重试、选择关卡、重置进度流程。

## 验收关注点

- `level_id` 必须与 `LEVEL_CONFIGS` 和 `LEVEL_ORDER` 完全一致。
- H5 宝箱奖励不依赖前 5 关技能解锁数量；新增关卡时需要确认 HP、速度和刷怪缩放。
- 体验关接入时，必须确认场景挂载 `level_experience.gd`，并验证救援逻辑不会污染普通关卡失败逻辑。
- 新增关卡后，关卡选择界面的禁用状态和提示文案要同步。
