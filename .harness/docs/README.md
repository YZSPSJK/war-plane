# Harness 领域文档索引

本目录承载 Tower Defense 当前玩法、关卡、技能与判定规则的主文档。根目录 `AGENTS.md` 只做索引和样式布局说明，不承载详细业务规则。

## 文档分工

- `gameplay-core.md`：当前玩法核心循环、战斗推进、成长、失败和通关规则。
- `combat-hit-logic.md`：子弹、技能池、敌人侧命中与伤害结算规范。
- `skills.md`：技能池、运行时技能效果、升级字段和角色技能草案。
- `level-construction.md`：关卡顺序、关卡配置、体验关特殊规则和新增关卡流程。

## 维护原则

1. 代码事实优先：以 `scripts/config/game_balance.gd`、`scripts/config/level_catalog.gd`、`scripts/levels/level1.gd` 和 `scripts/levels/level_experience.gd` 为准。
2. 业务规则集中：玩法、技能、关卡构造规则写入本目录，避免散落在 `AGENTS.md`。
3. 索引轻量：`AGENTS.md` 只链接文档、保留布局说明和执行约束。
4. 变更可验证：修改玩法或数值时，同步更新对应文档并说明验证入口。
