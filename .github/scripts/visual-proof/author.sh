#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

log() {
	echo "[visual-proof:author] $*"
}

err() {
	echo "[visual-proof:author] $*" >&2
}

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		err "${name} is required"
		exit 1
	fi
}

require_env GH_TOKEN
require_env GITHUB_REPOSITORY
require_env PR_NUMBER
require_env PR_HEAD_SHA
require_env PR_BASE_SHA
require_env CURSOR_API_KEY

log "step=start PR_NUMBER=${PR_NUMBER} HEAD_SHA=${PR_HEAD_SHA} BASE_SHA=${PR_BASE_SHA}"

log "step=parse-section reading PR body"
DECISION=$(
	gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json body --jq .body | node -e '
	const { shouldCaptureVisualProof } = require(process.argv[1]);
	const fs = require("fs");
	const body = fs.readFileSync(0, "utf8");
	process.stdout.write(JSON.stringify(shouldCaptureVisualProof(body)));
	' "${SCRIPT_DIR}/parse-section.js"
)

REASON=$(echo "$DECISION" | jq -r .reason)
log "step=parse-section reason=${REASON}"

if [[ "$REASON" != "missing-section" ]]; then
	log "step=skip section already present (${REASON})"
	exit 0
fi

PROMPT_FILE="${SCRIPT_DIR}/author-prompt.md"
SKILL_FILE="${REPO_ROOT}/.cursor/skills/visual-proof/SKILL.md"
EXAMPLES_FILE="${REPO_ROOT}/.cursor/skills/visual-proof/examples.md"

if [[ ! -f "$PROMPT_FILE" || ! -f "$SKILL_FILE" ]]; then
	err "author prompt or visual-proof skill is missing"
	exit 1
fi

PROMPT=$(cat "$PROMPT_FILE")
SKILL=$(cat "$SKILL_FILE")
EXAMPLES=""
if [[ -f "$EXAMPLES_FILE" ]]; then
	EXAMPLES=$(cat "$EXAMPLES_FILE")
fi

DYNAMIC_CONTEXT=$(cat << EOF
## Runtime
- Repository: ${GITHUB_REPOSITORY}
- PR Number: ${PR_NUMBER}
- PR Head SHA: ${PR_HEAD_SHA}
- PR Base SHA: ${PR_BASE_SHA}

## Skill
${SKILL}

## Examples
${EXAMPLES}
EOF
)

MODEL="${PR_REVIEW_MODEL:-}"
log "step=cursor-agent about to author Visual proof model=${MODEL:-default}"

cd "$REPO_ROOT"

set +e
if [[ -n "$MODEL" ]]; then
	timeout 180 cursor-agent --force --model "$MODEL" --output-format=text --print "$PROMPT" "$DYNAMIC_CONTEXT"
else
	timeout 180 cursor-agent --force --output-format=text --print "$PROMPT" "$DYNAMIC_CONTEXT"
fi
AGENT_EXIT=$?
set -e

if [[ "$AGENT_EXIT" -eq 124 ]]; then
	err "step=cursor-agent timed out after 3 minutes"
	exit 1
fi
if [[ "$AGENT_EXIT" -ne 0 ]]; then
	err "step=cursor-agent failed exit=${AGENT_EXIT}"
	exit "$AGENT_EXIT"
fi

AFTER=$(
	gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json body --jq .body | node -e '
	const { shouldCaptureVisualProof } = require(process.argv[1]);
	const fs = require("fs");
	const body = fs.readFileSync(0, "utf8");
	process.stdout.write(JSON.stringify(shouldCaptureVisualProof(body)));
	' "${SCRIPT_DIR}/parse-section.js"
)
AFTER_REASON=$(echo "$AFTER" | jq -r .reason)
log "step=verify reason=${AFTER_REASON}"

if [[ "$AFTER_REASON" == "missing-section" ]]; then
	err "cursor-agent finished but ## Visual proof is still missing"
	exit 1
fi

log "step=done"
