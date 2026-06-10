# Agent 索引

本文件只保留目录索引、执行约束和样式布局说明。玩法核心、技能规则、命中判定和关卡构造统一维护在 `.harness/docs/`。

## 目录索引

- `.harness/docs/README.md`：领域文档入口与维护原则。
- `.harness/docs/gameplay-core.md`：玩法核心循环、成长、失败和通关规则。
- `.harness/docs/combat-hit-logic.md`：战斗命中、子弹、技能池和伤害结算规范。
- `.harness/docs/skills.md`：技能池、技能数值、运行时效果和角色技能草案。
- `.harness/docs/level-construction.md`：关卡顺序、配置字段、体验关和新增关卡流程。
- `.harness/AGENT-WORKFLOW.md`：Harness Agent 协作流转协议。
- `.harness/tasks/`：任务卡目录。
- `.harness/handoff/`：任务交接文档目录。
- `.harness/checklists/`：完成定义与验收清单模板。

## 执行约束

1. 开发任务输出使用：Problem → Plan → Design → Code → Impact。
2. 规划模式输出使用：Problem → Plan → Design → Risk，且不生成代码。
3. 修改 Java 代码时，新类引用必须使用 `import`，依赖注入字段也必须使用导入后的类名。
4. 禁止在循环内部调用数据库查询。
5. 修改玩法、技能、关卡或数值时，同步更新 `.harness/docs/` 对应文档。

## 样式布局说明

- 默认采用移动端竖屏比例，基准为 `720x1280`。
- 顶部为关卡状态与进度信息区域。
- 中间是道路与墙体，用于分隔左右区域。
- 左侧为技能池区域，当前以橙色 `10x10` 点阵表达共享总血池。
- 右侧为敌人区域，普通、精英、Boss 当前按活动阶段互斥出现。
- 主角位于底部，可横向移动。
- 底部保留移动控制面板，按钮文本为“左”“右”。
- 失败和通关使用居中弹窗，保留重试、下一关、选择关卡等主要操作。
- 右侧敌人血量文字使用红色，浮动在当前活动敌人区域上方。
- 左侧技能池血量文字使用橙红色，并跟随技能池区域显示。
