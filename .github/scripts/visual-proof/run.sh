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

parse_visual_proof_section() {
	gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json body --jq .body | node -e '
	const { shouldCaptureVisualProof, extractBrokenCaption, buildOverlayCaption } = require(process.argv[1]);
	const fs = require("fs");
	const body = fs.readFileSync(0, "utf8");
	const result = shouldCaptureVisualProof(body);
	const broken = extractBrokenCaption(result.section);
	const overlay = buildOverlayCaption(result.section);
	process.stdout.write(JSON.stringify({ ...result, broken, overlay }));
	' "${SCRIPT_DIR}/parse-section.js"
}

log "step=start PR_NUMBER=${PR_NUMBER} HEAD_SHA=${HEAD_SHA} GITHUB_REPOSITORY=${GITHUB_REPOSITORY}"

log "step=parse-section about to read PR body via gh|node"
DECISION=$(parse_visual_proof_section)

# Author job runs in parallel on opened / ready_for_review. Wait for it to
# write ## Visual proof before skipping capture as missing-section.
if [[ "$(echo "$DECISION" | jq -r .reason)" == "missing-section" ]]; then
	log "step=wait-author polling PR body for Visual proof (up to 4 minutes)"
	for _ in 1 2 3 4 5 6 7 8; do
		sleep 30
		DECISION=$(parse_visual_proof_section)
		REASON=$(echo "$DECISION" | jq -r .reason)
		log "step=wait-author reason=${REASON}"
		if [[ "$REASON" != "missing-section" ]]; then
			break
		fi
	done
fi

REASON=$(echo "$DECISION" | jq -r .reason)
CAPTURE=$(echo "$DECISION" | jq -r .capture)
BROKEN=$(echo "$DECISION" | jq -r .broken)
OVERLAY=$(echo "$DECISION" | jq -r '.overlay // empty')

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
printf '%s' "$OVERLAY" > "${OUT_DIR}/overlay.txt"
echo "$DECISION" | jq -r '.section // empty' > "${OUT_DIR}/section.md"
export PLAYGROUND_URL
export VISUAL_PROOF_OUT_DIR="$OUT_DIR"
export VISUAL_PROOF_BROKEN="$BROKEN"
export VISUAL_PROOF_OVERLAY_FILE="${OUT_DIR}/overlay.txt"
export VISUAL_PROOF_SECTION_FILE="${OUT_DIR}/section.md"
export VISUAL_PROOF_SOURCE="fallback"

png_count() {
	find "$OUT_DIR" -maxdepth 1 -type f -name '*.png' 2>/dev/null | wc -l | tr -d ' '
}

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

if [[ -n "${CURSOR_API_KEY:-}" ]]; then
	log "step=actor about to run act.sh"
	if bash "${SCRIPT_DIR}/act.sh"; then
		export VISUAL_PROOF_SOURCE="actor"
		log "step=actor ok png_count=$(png_count)"
	else
		err "step=actor failed; falling back to generic walk"
	fi
else
	log "step=actor skipped (CURSOR_API_KEY empty)"
fi

if [[ "$(png_count)" -eq 0 ]]; then
	log "step=capture about to run capture.cjs OUT_DIR=${OUT_DIR}"
	if ! NODE_PATH="${SCRIPT_DIR}/node_modules" node "${SCRIPT_DIR}/capture.cjs"; then
		err "step=capture failed"
		exit 1
	fi
	export VISUAL_PROOF_SOURCE="fallback"
	log "step=capture ok"
fi

if command -v ffmpeg >/dev/null 2>&1 && [[ -f "${OUT_DIR}/visual-proof.webm" ]]; then
	log "step=ffmpeg about to transcode visual-proof.webm to mp4"
	if ffmpeg -y -i "${OUT_DIR}/visual-proof.webm" -an -c:v libx264 -pix_fmt yuv420p "${OUT_DIR}/visual-proof.mp4" >/dev/null 2>&1; then
		log "step=ffmpeg ok"
	else
		err "step=ffmpeg failed (keeping webm)"
	fi
fi

export GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
export GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}"
log "step=post-comment about to run post-comment.sh GITHUB_RUN_ID=${GITHUB_RUN_ID}"
if ! bash "${SCRIPT_DIR}/post-comment.sh"; then
	err "step=post-comment failed"
	exit 1
fi
log "step=done"
