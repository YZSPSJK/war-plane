#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$ROOT_DIR/state.yaml"
TASK_DIR="$ROOT_DIR/tasks"

usage() {
  cat <<'USAGE'
用法:
  .harness/bin/publish-task.sh --id TASK-001 --title "任务标题" --owner agent-dev [选项]

必填参数:
  --id           任务 ID（建议: TASK-数字）
  --title        任务标题
  --owner        负责人（需在 .harness/agents/agents.yaml 中存在）

可选参数:
  --priority     优先级，默认 P2
  --handoff-to   下一棒负责人，默认 agent-integrator
  --depends-on   依赖任务，逗号分隔，如 TASK-001,TASK-002
  --background   背景说明，默认 <背景说明>
USAGE
}

yaml_quote() {
  # 单引号 YAML 转义：' -> ''
  local s="$1"
  s=${s//\'/\'\'}
  printf "'%s'" "$s"
}

build_depends_yaml() {
  local deps_raw="$1"
  if [[ -z "$deps_raw" ]]; then
    echo "[]"
    return
  fi

  IFS=',' read -r -a deps <<<"$deps_raw"
  local out="["
  local first=1
  local dep
  for dep in "${deps[@]}"; do
    dep="$(echo "$dep" | xargs)"
    if [[ -z "$dep" ]]; then
      continue
    fi
    if [[ $first -eq 0 ]]; then
      out+=", "
    fi
    out+="$dep"
    first=0
  done
  out+="]"
  echo "$out"
}

ensure_state_file() {
  if [[ -f "$STATE_FILE" ]]; then
    return
  fi

  cat > "$STATE_FILE" <<'STATE'
board:
  todo: []
  in_progress: []
  blocked: []
  review: []
  done: []

tasks: {}
STATE
}

append_task_to_todo_board() {
  local task_id="$1"
  local tmp
  tmp="$(mktemp)"

  if ! rg -q "^\s*todo:\s*\[[^\]]*\]\s*$" "$STATE_FILE"; then
    echo "state.yaml 缺少 board.todo 内联数组，请先修复格式: $STATE_FILE" >&2
    exit 1
  fi

  awk -v tid="$task_id" '
  /^[[:space:]]*todo:[[:space:]]*\[[^\]]*\][[:space:]]*$/ {
    line = $0
    inside = line
    sub(/^[^[]*\[/, "", inside)
    sub(/\][[:space:]]*$/, "", inside)
    gsub(/[[:space:]]/, "", inside)

    count = split(inside, arr, ",")
    exists = 0
    items = ""

    for (i = 1; i <= count; i++) {
      if (arr[i] == "") {
        continue
      }
      if (arr[i] == tid) {
        exists = 1
      }
      if (items != "") {
        items = items ", "
      }
      items = items arr[i]
    }

    if (!exists) {
      if (items != "") {
        items = items ", "
      }
      items = items tid
    }

    sub(/\[[^\]]*\]/, "[" items "]", $0)
  }
  { print }
  ' "$STATE_FILE" > "$tmp"

  mv "$tmp" "$STATE_FILE"
}

append_task_meta() {
  local task_id="$1"
  local title="$2"
  local owner="$3"
  local priority="$4"
  local task_file_rel="$5"

  if rg -q "^\s{2}${task_id}:\s*$" "$STATE_FILE"; then
    return
  fi

  local title_q
  title_q="$(yaml_quote "$title")"

  local block
  block=$(cat <<META
  ${task_id}:
    title: ${title_q}
    status: todo
    owner: ${owner}
    priority: ${priority}
    file: ${task_file_rel}
META
)

  local tmp
  tmp="$(mktemp)"

  if rg -q "^tasks:\s*\{\}\s*$" "$STATE_FILE"; then
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^tasks:[[:space:]]*\{\}[[:space:]]*$ ]]; then
        echo "tasks:" >> "$tmp"
        echo "$block" >> "$tmp"
      else
        echo "$line" >> "$tmp"
      fi
    done < "$STATE_FILE"
    mv "$tmp" "$STATE_FILE"
    return
  fi

  if ! rg -q "^tasks:\s*$" "$STATE_FILE"; then
    echo "state.yaml 缺少 tasks 顶层字段，请先修复格式: $STATE_FILE" >&2
    exit 1
  fi

  cp "$STATE_FILE" "$tmp"
  {
    echo "$block"
  } >> "$tmp"
  mv "$tmp" "$STATE_FILE"
}

validate_owner() {
  local owner="$1"
  if ! rg -q "^\s*- id:\s*${owner}\s*$" "$ROOT_DIR/agents/agents.yaml"; then
    echo "owner 不存在于 .harness/agents/agents.yaml: $owner" >&2
    exit 1
  fi
}

main() {
  local task_id=""
  local title=""
  local owner=""
  local priority="P2"
  local handoff_to="agent-integrator"
  local depends_on=""
  local background="<背景说明>"

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --id)
        task_id="$2"
        shift 2
        ;;
      --title)
        title="$2"
        shift 2
        ;;
      --owner)
        owner="$2"
        shift 2
        ;;
      --priority)
        priority="$2"
        shift 2
        ;;
      --handoff-to)
        handoff_to="$2"
        shift 2
        ;;
      --depends-on)
        depends_on="$2"
        shift 2
        ;;
      --background)
        background="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "未知参数: $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [[ -z "$task_id" || -z "$title" || -z "$owner" ]]; then
    echo "缺少必填参数" >&2
    usage
    exit 1
  fi

  if [[ ! "$task_id" =~ ^TASK-[0-9A-Za-z_-]+$ ]]; then
    echo "任务 ID 格式不合法，建议使用 TASK-001 形式: $task_id" >&2
    exit 1
  fi

  validate_owner "$owner"

  mkdir -p "$TASK_DIR"
  ensure_state_file

  local task_file="$TASK_DIR/${task_id}.yaml"
  if [[ -f "$task_file" ]]; then
    echo "任务文件已存在: $task_file" >&2
    exit 1
  fi

  local depends_yaml
  depends_yaml="$(build_depends_yaml "$depends_on")"

  local state_backup
  state_backup="$(mktemp)"
  cp "$STATE_FILE" "$state_backup"
  local task_created=0

  cleanup_on_error() {
    if [[ $task_created -eq 1 && -f "$task_file" ]]; then
      rm -f "$task_file"
    fi
    if [[ -f "$state_backup" ]]; then
      cp "$state_backup" "$STATE_FILE"
      rm -f "$state_backup"
    fi
  }

  trap cleanup_on_error ERR

  cat > "$task_file" <<TASK
id: ${task_id}
title: $(yaml_quote "$title")
status: todo
priority: ${priority}
owner: ${owner}
depends_on: ${depends_yaml}

context:
  background: $(yaml_quote "$background")
  constraints:
    - <约束1>
    - <约束2>

scope:
  include:
    - <允许修改的文件或目录>
  exclude:
    - <禁止修改的文件或目录>

inputs:
  - <输入材料1>
  - <输入材料2>

deliverables:
  - <交付物1>
  - <交付物2>

dod:
  - <完成标准1>
  - <完成标准2>

handoff_to: ${handoff_to}
risk:
  - <风险1>
  - <风险2>
TASK
  task_created=1

  append_task_to_todo_board "$task_id"
  append_task_meta "$task_id" "$title" "$owner" "$priority" ".harness/tasks/${task_id}.yaml"

  trap - ERR
  rm -f "$state_backup"

  echo "已发布任务: $task_id"
  echo "任务文件: $task_file"
  echo "状态看板已更新: $STATE_FILE"
}

main "$@"
