#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
OUT_DIR="${VISUAL_PROOF_OUT_DIR:-${REPO_ROOT}/visual-proof-shots}"

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		echo "${name} is required" >&2
		exit 1
	fi
}

require_env GH_TOKEN
require_env GITHUB_REPOSITORY
require_env PR_NUMBER
require_env HEAD_SHA

BODY=$(gh pr view "$PR_NUMBER" --repo "$GITHUB_REPOSITORY" --json body --jq .body)

DECISION=$(node -e '
	const { shouldCaptureVisualProof, extractBrokenCaption } = require(process.argv[1]);
	const fs = require("fs");
	const body = fs.readFileSync(0, "utf8");
	const result = shouldCaptureVisualProof(body);
	const broken = extractBrokenCaption(result.section);
	process.stdout.write(JSON.stringify({ ...result, broken }));
' "${SCRIPT_DIR}/parse-section.js" <<<"$BODY")

REASON=$(echo "$DECISION" | jq -r .reason)
CAPTURE=$(echo "$DECISION" | jq -r .capture)
BROKEN=$(echo "$DECISION" | jq -r .broken)

echo "Visual proof decision: ${REASON}"

if [[ "$CAPTURE" != "true" ]]; then
	echo "Skipping capture (${REASON})"
	exit 0
fi

DEPLOYMENT_ID=$(
	gh api "repos/${GITHUB_REPOSITORY}/deployments?environment=playground-preview&sha=${HEAD_SHA}&per_page=5" \
		--jq '.[0].id // empty'
)

if [[ -z "${DEPLOYMENT_ID}" ]]; then
	echo "No playground-preview deployment for ${HEAD_SHA}" >&2
	exit 1
fi

PLAYGROUND_URL=$(
	gh api "repos/${GITHUB_REPOSITORY}/deployments/${DEPLOYMENT_ID}/statuses" \
		--jq '[.[] | select(.environment_url != null and .environment_url != "")][0].environment_url // empty'
)

if [[ -z "$PLAYGROUND_URL" ]]; then
	echo "playground-preview deployment ${DEPLOYMENT_ID} has no environment_url" >&2
	exit 1
fi

mkdir -p "$OUT_DIR"
export PLAYGROUND_URL
export VISUAL_PROOF_OUT_DIR="$OUT_DIR"
export VISUAL_PROOF_BROKEN="$BROKEN"

cd "$SCRIPT_DIR"
npm install --no-package-lock --no-fund --silent playwright@1.55.1
npx playwright install chromium

cd "$REPO_ROOT"
NODE_PATH="${SCRIPT_DIR}/node_modules" node "${SCRIPT_DIR}/capture.mjs"

export GITHUB_SERVER_URL="${GITHUB_SERVER_URL:-https://github.com}"
export GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}"
bash "${SCRIPT_DIR}/post-comment.sh"
