# Agent Workflow（无脚本版）

## 1. 目标

本协议用于让 Agent 直接接管任务发布与流转，不依赖 `bin/publish-task.sh`。

## 2. 角色分工

1. `agent-arch`：发布任务、定义范围、拆分依赖。
2. `agent-dev`：实现与自检，提交 handoff。
3. `agent-ui`：界面与交互相关实现与验证。
4. `agent-integrator`：联调验收、发布结论、关单。

## 3. 状态机

任务状态固定为：

1. `todo`
2. `in_progress`
3. `review`
4. `blocked`
5. `done`

`state.yaml` 中 `board` 与 `tasks.<TASK_ID>.status` 必须一致。

## 4. 发布任务（由 agent-arch 执行）

1. 复制 `tasks/TASK-template.yaml` 为 `tasks/TASK-xxx.yaml` 并补齐字段。
2. 在 `state.yaml` 中执行两处更新：
   - `board.todo` 追加 `TASK-xxx`
   - `tasks.TASK-xxx` 写入元信息
3. 确认 owner 与 `agents/agents.yaml` 的 `id` 一致。

`state.yaml` 最小元信息格式：

```yaml
tasks:
  TASK-003:
    title: "示例任务"
    status: todo
    owner: agent-dev
    priority: P2
    file: .harness/tasks/TASK-003.yaml
```

## 5. 认领与推进（由 owner 执行）

1. 从 `board.todo` 移除任务。
2. 加入 `board.in_progress`。
3. 更新 `tasks.<TASK_ID>.status: in_progress`。
4. 实施变更时严格遵守任务卡 `scope.include/exclude`。

## 6. 提交评审（由 owner 执行）

1. 完成后从 `in_progress` 迁移到 `review`。
2. 更新 `tasks.<TASK_ID>.status: review`。
3. 基于 `handoff/HANDOFF-template.md` 生成 `handoff/HANDOFF-<TASK_ID>.md`。
4. 在 handoff 中写清：
   - 已完成项
   - 变更文件
   - 验证结果
   - 风险和下一步

## 7. 验收关单（由 agent-integrator 执行）

1. 按 `checklists/DoD-template.md` 验收。
2. 通过：
   - 从 `review` 迁移到 `done`
   - 更新 `tasks.<TASK_ID>.status: done`
3. 未通过：
   - 回退到 `in_progress` 或标记 `blocked`
   - 在 handoff 或任务卡补充阻塞原因

## 8. 执行约束

1. 禁止跳过 `state.yaml` 直接口头变更状态。
2. 禁止任务状态与看板分栏不一致。
3. 禁止未填写 handoff 直接关单。
4. 禁止超出 `scope.exclude` 的改动。
