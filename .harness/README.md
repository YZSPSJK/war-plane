# Harness 协作模板

本目录用于多 Agent 协作编排，不包含任何具体业务代码。

## 目录说明

- `state.yaml`：任务全局状态看板
- `agents/agents.yaml`：角色定义与职责边界
- `tasks/TASK-template.yaml`：任务卡模板
- `handoff/HANDOFF-template.md`：任务接力模板
- `checklists/DoD-template.md`：完成定义检查模板
- `AGENT-WORKFLOW.md`：Agent 原生协作协议（推荐）
- `bin/publish-task.sh`：脚本发布入口（兜底）

## Agent 原生接入（推荐）

默认走 Agent 协议，不依赖脚本：

1. `agent-arch` 负责发布任务：创建 `tasks/TASK-xxx.yaml`，登记 `state.yaml` 的 `board.todo` 和 `tasks` 元信息。
2. 任务 owner 从 `todo` 认领后，迁移到 `in_progress` 并更新 `tasks.<id>.status`。
3. 开发完成后进入 `review`，填写 `handoff/HANDOFF-xxx.md`。
4. `agent-integrator` 验收通过后迁移到 `done` 并给出发布结论。

协议细节见：`AGENT-WORKFLOW.md`。

## 脚本发布（兜底）

如果临时没有可用编排 Agent，再使用脚本发布：

```bash
.harness/bin/publish-task.sh \
  --id TASK-001 \
  --title "补齐战斗命中判定日志" \
  --owner agent-dev \
  --priority P1 \
  --handoff-to agent-integrator \
  --depends-on TASK-000
```

脚本会自动完成：

1. 在 `.harness/tasks/` 创建 `${TASK_ID}.yaml`。
2. 将任务加入 `state.yaml` 的 `board.todo`。
3. 在 `state.yaml.tasks` 写入任务元信息（title/owner/priority/file/status）。

## 推荐流程

1. 先按 `AGENT-WORKFLOW.md` 走 Agent 协议。
2. Agent 开始执行前，对齐 `scope` 与 `dod`。
3. 完成后填写 `handoff/HANDOFF-template.md` 并移交下一棒。
4. 集成 Agent 依据 `checklists/DoD-template.md` 验收后，将状态改为 `done`。
