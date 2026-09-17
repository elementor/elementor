#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
OUT_DIR="${VISUAL_PROOF_OUT_DIR:-${REPO_ROOT}/visual-proof-shots}"

log() {
	echo "[visual-proof] $*"
}

err() {
	echo "[visual-proof] $*" >&2
}

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		err "step=require-env error=${name} is required"
		exit 1
	fi
}

require_env GH_TOKEN
require_env GITHUB_REPOSITORY
require_env PR_NUMBER
require_env HEAD_SHA

log "step=start PR_NUMBER=${PR_NUMBER} HEAD_SHA=${HEAD_SHA} GITHUB_REPOSITORY=${GITHUB_REPOSITORY}"

log "step=parse-section about to read PR body via gh|node"
DECISION=$(
	gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json body --jq .body | node -e '
	const { shouldCaptureVisualProof, extractBrokenCaption } = require(process.argv[1]);
	const fs = require("fs");
	const body = fs.readFileSync(0, "utf8");
	const result = shouldCaptureVisualProof(body);
	const broken = extractBrokenCaption(result.section);
	process.stdout.write(JSON.stringify({ ...result, broken }));
	' "${SCRIPT_DIR}/parse-section.js"
)

REASON=$(echo "$DECISION" | jq -r .reason)
CAPTURE=$(echo "$DECISION" | jq -r .capture)
BROKEN=$(echo "$DECISION" | jq -r .broken)

log "step=parse-section reason=${REASON} capture=${CAPTURE}"
echo "Visual proof decision: ${REASON}"

if [[ "$CAPTURE" != "true" ]]; then
	log "step=skip Skipping capture (${REASON})"
	exit 0
fi

log "step=resolve-deployment about to list playground-preview deployments for ${HEAD_SHA}"
DEPLOYMENT_ID=$(
	gh api "repos/${GITHUB_REPOSITORY}/deployments?environment=playground-preview&sha=${HEAD_SHA}&per_page=5" \
		--jq '.[0].id // empty'
)

if [[ -z "${DEPLOYMENT_ID}" ]]; then
	err "step=resolve-deployment deployment_id=empty"
	err "No playground-preview deployment for ${HEAD_SHA}"
	exit 1
fi

log "step=resolve-deployment deployment_id=${DEPLOYMENT_ID}"

log "step=resolve-url about to list success statuses for deployment ${DEPLOYMENT_ID}"
PLAYGROUND_URL=$(
	gh api "repos/${GITHUB_REPOSITORY}/deployments/${DEPLOYMENT_ID}/statuses" \
		--jq '[.[] | select(.state == "success" and .environment_url != null and .environment_url != "")][0].environment_url // empty'
)

if [[ -z "$PLAYGROUND_URL" ]]; then
	err "step=resolve-url PLAYGROUND_URL=empty"
	err "playground-preview deployment ${DEPLOYMENT_ID} has no success environment_url"
	exit 1
fi

log "step=resolve-url PLAYGROUND_URL=${PLAYGROUND_URL}"

mkdir -p "$OUT_DIR"
export PLAYGROUND_URL
export VISUAL_PROOF_OUT_DIR="$OUT_DIR"
export VISUAL_PROOF_BROKEN="$BROKEN"

cd "$SCRIPT_DIR"
log "step=npm-install about to install local package.json playwright in ${SCRIPT_DIR} (workspaces off)"
if ! npm install --no-package-lock --no-fund --workspaces=false --loglevel error; then
	err "step=npm-install failed"
	exit 1
fi
log "step=npm-install ok"

log "step=playwright-install about to run ./node_modules/.bin/playwright install chromium"
if ! ./node_modules/.bin/playwright install chromium; then
	err "step=playwright-install failed"
	exit 1
fi
log "step=playwright-install ok"

cd "$REPO_ROOT"
log "step=capture about to run capture.cjs OUT_DIR=${OUT_DIR}"
if ! NODE_PATH="${SCRIPT_DIR}/node_modules" node "${SCRIPT_DIR}/capture.cjs"; then
	err "step=capture failed"
	exit 1
fi
log "step=capture ok"

export GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
export GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}"
log "step=post-comment about to run post-comment.sh GITHUB_RUN_ID=${GITHUB_RUN_ID}"
if ! bash "${SCRIPT_DIR}/post-comment.sh"; then
	err "step=post-comment failed"
	exit 1
fi
log "step=done"
