# Neon Tower Defense H5

这是一个移动端竖屏塔防小游戏。当前主入口已调整为 H5：直接打开 `index.html` 即可运行，不依赖 Godot 导出或前端构建工具。

## 当前入口

- H5 入口：`index.html`
- H5 样式：`web/styles.css`
- H5 配置：`web/config.js`
- H5 存档：`web/progress.js`
- H5 奖励池：`web/rewards.js`
- H5 主运行时：`web/game.js`
- 旧 Godot 工程：`project.godot`、`scenes/`、`scripts/`

Godot 文件仍保留，作为历史实现和玩法规则参考；当前浏览器版本的可运行入口是 `index.html`。

## H5 文件拆分

- `index.html` 只保留页面结构和脚本引用。
- `web/styles.css` 负责所有页面样式、弹窗、宝箱图标和奖励开启特效。
- `web/config.js` 维护关卡、数值和稀有度配置。
- `web/progress.js` 维护 `localStorage.neonTowerProgress` 的读写与默认结构。
- `web/rewards.js` 维护宝箱奖励数量、稀有度和 3 选 1 基础升级卡池。
- `web/game.js` 维护 Canvas 主循环、输入、战斗推进和绘制。

## 如何运行

在浏览器中打开：

```text
index.html
```

如果浏览器限制本地文件访问，也可以在项目目录启动任意静态服务器，例如：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173/`。

## H5 玩法

- 玩家位于底部，可用 `A` / `←`、`D` / `→` 或底部“左”“右”按钮移动。
- 点击或拖动画布会把主角移动到触点横向位置。
- 主角自动向上发射子弹。
- 中央霓虹墙体把命中分为左右两侧：
  - 左侧命中宝箱，击碎后弹出 `1 / 3 / 5` 个可开启宝箱。
  - 右侧命中敌人，按候选排序结算伤害。
- 宝箱奖励轮数为 `1 / 3 / 5` 次，概率为 `80% / 15% / 5%`。
- 点击每个宝箱后进入 3 选 1，选择后继续打开下一个宝箱或恢复战斗。
- 击败怪物获得经验，升级后从 3 张卡中选择一个强化。
- 升级卡分为蓝色普通、紫色稀有、橙色传说，概率为 `70% / 25% / 5%`。
- 当前只保留基础强化：子弹数量、子弹射速、子弹穿透、子弹伤害。
- 普通敌人、精英怪、单体 Boss 按阶段推进；只有精英怪和 Boss 显示血条。
- 敌人到达主角水平线或触碰主角时失败。
- 清空 Boss 后通关，死亡和通关都会结算金币。

## 视觉风格

当前 H5 版本不使用像素素材。画面采用深色背景、霓虹线条、描边方块和菱形来表达主角、宝箱、墙体与敌人。宝箱不显示血条，只在宝箱下方显示数字血量；宝箱击碎后的奖励弹窗使用烟花、彩蛋、星火和线框宝箱图标，3 选 1 卡片按子弹数量、射速、穿透、伤害展示不同图标。

## 玩法与协作文档

玩法核心、技能规则、命中判定和关卡构造维护在 `.harness/docs/`：

- `.harness/docs/gameplay-core.md`
- `.harness/docs/combat-hit-logic.md`
- `.harness/docs/skills.md`
- `.harness/docs/level-construction.md`

Agent 入口索引与移动端样式布局说明见：`AGENTS.md`。
