#!/usr/bin/env bash
set -euo pipefail

# Collect Playwright video.webm files from downloaded shard artifacts and
# post (or update) a PR comment with a link to the workflow run.
# No files → exit 0 (most PRs have no @video-proof tests).

ARTIFACTS_DIR="${PLAYWRIGHT_RESULTS_DIR:-playwright-shard-results}"
STAGING_DIR="${PLAYWRIGHT_VIDEO_PROOF_DIR:-playwright-video-proof}"
MARKER="<!-- playwright-video-proof -->"

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		echo "${name} is required" >&2
		exit 1
	fi
}

require_env GITHUB_REPOSITORY
require_env GITHUB_SERVER_URL
require_env GITHUB_RUN_ID
require_env PR_NUMBER

if [[ "$PR_NUMBER" == "null" ]]; then
	echo "No PR number, skipping video-proof comment"
	exit 0
fi

mkdir -p "$STAGING_DIR"
count=0

while IFS= read -r -d '' file; do
	count=$((count + 1))
	parent="$(basename "$(dirname "$file")")"
	cp "$file" "${STAGING_DIR}/$(printf '%02d' "$count")-${parent}.webm"
done < <(find "$ARTIFACTS_DIR" -type f -name 'video.webm' -print0 2>/dev/null || true)

if [[ "$count" -eq 0 ]]; then
	echo "No video.webm files under ${ARTIFACTS_DIR}; skipping comment"
	exit 0
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
	echo "PLAYWRIGHT_VIDEO_PROOF_COUNT=${count}" >> "$GITHUB_OUTPUT"
fi

run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

list_items=""
while IFS= read -r clip; do
	list_items+="- \`$(basename "$clip")\`"$'\n'
done < <(find "$STAGING_DIR" -type f -name '*.webm' | sort)

COMMENT_BODY=$(
	cat <<EOF
${MARKER}
## Playwright video proof

Clips below come from passing tests tagged \`@video-proof\` (always recorded, not failure-only).

GitHub cannot play \`.webm\` in the PR body. Download artifact **playwright-video-proof** from [this run](${run_url}).

${list_items}
EOF
)

existing_id=$(
	gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --paginate \
		--jq ".[] | select(.body | contains(\"${MARKER}\")) | .id" | head -n 1 || true
)

payload=$(jq -n --arg body "$COMMENT_BODY" '{body: $body}')

if [[ -n "${existing_id:-}" ]]; then
	echo "$payload" | gh api "repos/${GITHUB_REPOSITORY}/issues/comments/${existing_id}" -X PATCH --input -
	echo "Updated video-proof comment ${existing_id} on PR #${PR_NUMBER}"
else
	echo "$payload" | gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --input -
	echo "Posted video-proof comment on PR #${PR_NUMBER}"
fi
