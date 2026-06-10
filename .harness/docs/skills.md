# 技能文档

## 事实来源

- 技能池与数值：`scripts/config/game_balance.gd`
- 技能运行时：`scripts/levels/level1.gd`
- 旧草案来源：`docs/skill/技能.md`、`docs/skill/角色技能.md`

## 通用规则

- 主动技能默认共用 `common_cd = 15.0`。
- 基础攻击倍率默认 `base_damage_mult = 1.1`。
- 持续伤害默认跳伤间隔 `tick_interval = 1.0` 秒。
- 技能解锁池当前顺序：
  1. 大手里剑
  2. 苦无
  3. 影分身
  4. 火遁.豪火球
  5. 火遁.凤仙花
  6. 土遁.土流壁
  7. 土遁·黄泉沼

前 5 关采用顺序解锁时，只允许解锁全局技能池游标指向的下一个技能。

## 当前技能池

### 视觉素材映射

当前技能视觉素材位于 `assets/pixel_skills/`，用于替换运行时绘制的纯色占位：

- 大手里剑：`shuriken.png`
- 苦无：`kunai.png`
- 影分身：复用主角帧并使用蓝色半透明调制
- 火遁.豪火球：`fireball.png`
- 火遁.凤仙花：`phoenix_ember.png`、`burn_patch.png`
- 土遁.土流壁：`earth_wall.png`
- 土遁·黄泉沼：`swamp_pool.png`
- 技能池血量格：`chakra_orb.png`、`spent_orb.png`

### 大手里剑

- 定位：范围型投射物 / 清线。
- 释放：自动选择最近敌人，在目标点生成范围区域。
- 效果：立即造成一次范围伤害，并在停留期间按跳伤间隔持续伤害。
- 基础字段：
  - `radius_cells = 2.0`
  - `linger_seconds = 1.0`
  - `damage_mult = 1.1`
  - `fly_speed_mult = 1.0`
- 升级字段：
  - `radius_cells_per_level = 1.0`
  - `linger_percent_per_level = 0.5`
  - `fly_speed_percent_per_level = 0.2`

### 苦无

- 定位：单体 / 直线穿透。
- 释放：主角基础射击时额外发射苦无。
- 效果：命中敌人后可穿透，并附加毒效果。
- 基础字段：
  - `extra_pierce = 1`
  - `damage_decay_ratio = 0.0`
  - `poison_damage = 1.0`
  - `poison_duration = 5.0`
  - `poison_interval = 1.0`
- 升级字段：
  - `extra_pierce_per_level = 1`
  - `poison_damage_per_level = 1.0`
  - `poison_duration_per_level = 1.0`
  - `crit_rate_per_level = 0.05`
  - `crit_damage_per_level = 0.2`

### 影分身

- 定位：召唤 / 增益。
- 释放：解锁时立即召唤，冷却完成后继续自动召唤。
- 效果：分身跟随主角横向位置偏移，并自动发射普通弹。
- 基础字段：
  - `count = 1`
  - `duration = 5.0`
  - `inherit_attack_ratio = 1.0`
  - `max_alive = 10`
- 升级字段：
  - `count_per_level = 1`
  - `duration_per_level = 1.0`
  - `inherit_attack_ratio_per_level = 0.1`
  - `max_alive_per_level = 1`

### 火遁.豪火球

- 定位：范围爆发。
- 释放：自动选择最近敌人，从主角位置向目标发射火球。
- 效果：直击伤害、范围爆炸、范围击退。
- 基础字段：
  - `direct_damage = 5.0`
  - `explode_radius_cells = 2.0`
  - `knockback_cells = 1.0`
  - `chain_explode_count = 0`
  - `fly_speed_mult = 1.0`
- 升级字段：
  - `direct_damage_per_level = 1.0`
  - `explode_radius_cells_per_level = 1.0`
  - `knockback_cells_per_level = 0.5`
  - `chain_explode_count_per_level = 1`
  - `fly_speed_percent_per_level = 0.2`

### 火遁.凤仙花

- 定位：多段投射 / 区域灼烧。
- 释放：多次随机选择敌人并发射小火球。
- 效果：直击伤害，并在命中点生成灼烧区域。
- 基础字段：
  - `count = 3`
  - `hit_damage = 5.0`
  - `burn_damage = 1.0`
  - `burn_duration = 5.0`
  - `burn_interval = 1.0`
  - `burn_radius_cells = 2.0`
- 升级字段：
  - `count_per_level = 1`
  - `burn_damage_per_level = 1.0`
  - `burn_duration_per_level = 1.0`
  - `burn_interval_reduce_per_level = 0.1`
  - `scatter_angle_per_level = 5.0`

### 土遁.土流壁

- 定位：地形阻挡 / 防线控制。
- 释放：在敌人通道底部生成横向墙体。
- 效果：阻挡敌人，敌人接触时按 `contact_dps` 扣墙体血量。
- 基础字段：
  - `wall_hp = 50.0`
  - `duration = 5.0`
  - `slow_ratio = 0.0`
  - `width_units = 2.0`
  - `contact_dps = 8.0`
  - `count = 1`
- 升级字段：
  - `wall_hp_per_level = 10.0`
  - `duration_per_level = 1.0`
  - `width_units_per_level = 0.5`
  - `count_per_level = 1`
  - `slow_ratio_per_level = 0.05`

### 土遁·黄泉沼

- 定位：场地控制 / 大范围减速。
- 释放：优先选择随机敌人位置；无敌人时落在敌人通道中心。
- 效果：范围内减速，并提高敌人受到的伤害。
- 基础字段：
  - `radius_cells = 3.0`
  - `duration = 5.0`
  - `slow_ratio = 0.2`
  - `armor_break_ratio = 0.2`
  - `dot_damage = 0.0`
- 升级字段：
  - `radius_cells_per_level = 1.0`
  - `duration_per_level = 1.0`
  - `slow_ratio_per_level = 0.05`
  - `armor_break_ratio_per_level = 0.05`
  - `dot_damage_per_level = 1.0`

## 体验关特殊技能

`level_experience.gd` 中定义了“神罗天征”体验关特例：每次成功解锁技能后触发一次清场。

- 清空右侧所有普通、精英和 Boss 敌人。
- 将清空的敌人数量计入击杀。
- 在顶部提示“神罗天征：右侧敌人已清场”。

该技能当前不在 `GameBalance.skill_unlock_pool()` 中，属于体验关脚本特例。需要注意：`scenes/levels/level_experience.tscn` 当前未挂载 `level_experience.gd`，所以该特例脚本逻辑尚未在体验关场景中生效。

## 角色技能草案

以下仍是设计草案，当前未接入运行时代码：

- 鸣人 / 螺旋丸：触碰敌人后爆炸；升级增加爆炸范围。
- 鸣人 / 风遁手里剑：穿透并停留持续伤害；升级增加穿透、数量和持续伤害。
- 佐助 / 千鸟：触碰敌人后链式传递伤害；升级增加传递数量，并附加麻痹减速。
- 佐助 / 风遁手里剑：与鸣人草案同名同效果，后续需要确认是否共享技能或做角色差异化。

## 待确认规则

- 同名异常状态是否叠加、刷新或取最高值。
- 击退与减速同时存在时的速度下限。
- 召唤物是否继承角色通用升级效果。
- 技能升级上限与每级成长曲线。
- 暴击字段目前存在于苦无配置，但运行时尚未实现。
