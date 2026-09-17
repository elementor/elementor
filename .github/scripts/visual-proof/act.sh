#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
OUT_DIR="${VISUAL_PROOF_OUT_DIR:-${REPO_ROOT}/visual-proof-shots}"

log() {
	echo "[visual-proof:actor] $*"
}

err() {
	echo "[visual-proof:actor] $*" >&2
}

png_count() {
	find "$OUT_DIR" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' '
}

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		err "${name} is required"
		exit 1
	fi
}

require_env CURSOR_API_KEY
require_env PLAYGROUND_URL
require_env VISUAL_PROOF_SECTION_FILE
require_env VISUAL_PROOF_OUT_DIR

if [[ ! -f "$VISUAL_PROOF_SECTION_FILE" ]]; then
	err "section file missing: ${VISUAL_PROOF_SECTION_FILE}"
	exit 1
fi

PROMPT_FILE="${SCRIPT_DIR}/storyboard-prompt.md"
if [[ ! -f "$PROMPT_FILE" ]]; then
	err "storyboard prompt missing"
	exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")
SECTION=$(cat "$VISUAL_PROOF_SECTION_FILE")
MODEL="${PR_REVIEW_MODEL:-}"

DYNAMIC_CONTEXT=$(cat << EOF
## Runtime
- PLAYGROUND_URL: ${PLAYGROUND_URL}
- PLAYGROUND_HELPERS: ${SCRIPT_DIR}/playground.cjs
- PLAYGROUND_NODE_PATH: ${SCRIPT_DIR}/node_modules
- VISUAL_PROOF_OUT_DIR: ${OUT_DIR}
- VISUAL_PROOF_SECTION_FILE: ${VISUAL_PROOF_SECTION_FILE}
- VISUAL_PROOF_OVERLAY_FILE: ${VISUAL_PROOF_OVERLAY_FILE:-}

## Visual proof section
${SECTION}
EOF
)

log "step=cursor-agent storyboard actor model=${MODEL:-default}"
cd "$REPO_ROOT"
export PLAYGROUND_HELPERS="${SCRIPT_DIR}/playground.cjs"
export PLAYGROUND_NODE_PATH="${SCRIPT_DIR}/node_modules"

set +e
if [[ -n "$MODEL" ]]; then
	timeout 600 cursor-agent --force --model "$MODEL" --output-format=text --print "$PROMPT" "$DYNAMIC_CONTEXT"
else
	timeout 600 cursor-agent --force --output-format=text --print "$PROMPT" "$DYNAMIC_CONTEXT"
fi
AGENT_EXIT=$?
set -e

if [[ "$AGENT_EXIT" -eq 124 ]]; then
	err "step=cursor-agent timed out after 10 minutes"
	exit 1
fi
if [[ "$AGENT_EXIT" -ne 0 ]]; then
	err "step=cursor-agent failed exit=${AGENT_EXIT}"
	exit "$AGENT_EXIT"
fi

if [[ "$(png_count)" -eq 0 && -f "${OUT_DIR}/actor.cjs" ]]; then
	log "step=run-actor.cjs"
	if ! NODE_PATH="${SCRIPT_DIR}/node_modules" node "${OUT_DIR}/actor.cjs"; then
		err "step=run-actor.cjs failed"
		exit 1
	fi
fi

COUNT="$(png_count)"
log "step=verify png_count=${COUNT}"
if [[ "$COUNT" -eq 0 ]]; then
	err "storyboard actor produced no PNGs"
	exit 1
fi

log "step=done"
