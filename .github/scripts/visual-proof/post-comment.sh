#!/usr/bin/env bash
set -euo pipefail

# Upload PNGs to ci/visual-proof-assets and comment on the PR.
# Modeled on Angie videoproof/post-comment.sh (inline images via raw git URLs).

ARTIFACTS_DIR="${VISUAL_PROOF_OUT_DIR:-visual-proof-shots}"
MARKER="<!-- visual-proof-ci -->"
ASSETS_BRANCH="ci/visual-proof-assets"
MAX_SHOTS="${VISUAL_PROOF_MAX_SHOTS:-3}"

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

run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

if [[ ! -d "$ARTIFACTS_DIR" ]] || [[ -z "$(find "$ARTIFACTS_DIR" -type f -name '*.png' -print -quit)" ]]; then
	echo "No PNG shots in ${ARTIFACTS_DIR}; skipping comment"
	exit 0
fi

ensure_assets_branch() {
	if gh api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${ASSETS_BRANCH}" &>/dev/null; then
		return 0
	fi
	local default_branch base_sha
	default_branch=$(gh api "repos/${GITHUB_REPOSITORY}" --jq .default_branch)
	base_sha=$(gh api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${default_branch}" --jq .object.sha)
	gh api "repos/${GITHUB_REPOSITORY}/git/refs" \
		-f ref="refs/heads/${ASSETS_BRANCH}" \
		-f sha="${base_sha}" >/dev/null
}

upload_png() {
	local local_path="$1"
	local repo_path="$2"
	local b64_file payload_file

	b64_file=$(mktemp)
	payload_file=$(mktemp)
	base64 -w 0 "$local_path" >"$b64_file"
	jq -n \
		--arg message "Visual proof shot (PR #${PR_NUMBER}, run ${GITHUB_RUN_ID})" \
		--arg branch "${ASSETS_BRANCH}" \
		--rawfile content "$b64_file" \
		'{message: $message, content: $content, branch: $branch}' >"$payload_file"
	gh api "repos/${GITHUB_REPOSITORY}/contents/${repo_path}" -X PUT --input "$payload_file" >/dev/null
	rm -f "$b64_file" "$payload_file"
	echo "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/raw/${ASSETS_BRANCH}/${repo_path}"
}

ensure_assets_branch

COMMENT_SECTIONS=()
COMMENT_SECTIONS+=("${MARKER}")
COMMENT_SECTIONS+=("## Visual proof")
COMMENT_SECTIONS+=("")
COMMENT_SECTIONS+=("Shots from this PR’s Playground preview. Generic walk: WP Admin → Pages → Edit with Elementor (not the PR’s **Steps**).")
COMMENT_SECTIONS+=("")

count=0
while IFS= read -r -d '' file; do
	count=$((count + 1))
	name=$(basename "$file")
	object_path="ci/visual-proof/pr-${PR_NUMBER}/run-${GITHUB_RUN_ID}/${name}"
	if url=$(upload_png "$file" "$object_path"); then
		COMMENT_SECTIONS+=("**${name}**")
		COMMENT_SECTIONS+=("![${name}](${url})")
		COMMENT_SECTIONS+=("")
	fi
	if [[ "$count" -ge "$MAX_SHOTS" ]]; then
		break
	fi
done < <(find "$ARTIFACTS_DIR" -type f -name '*.png' -print0 | sort -z)

COMMENT_SECTIONS+=("_Also on the [workflow run](${run_url})._")

COMMENT_BODY=$(printf '%s\n' "${COMMENT_SECTIONS[@]}")

existing_id=$(
	gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --paginate \
		--jq "[.[] | select(.body | contains(\"visual-proof-ci\")) | .id][0] // empty" || true
)

payload=$(jq -n --arg body "$COMMENT_BODY" '{body: $body}')

if [[ -n "${existing_id:-}" && "${existing_id}" != "null" ]]; then
	echo "$payload" | gh api "repos/${GITHUB_REPOSITORY}/issues/comments/${existing_id}" -X PATCH --input -
	echo "Updated visual-proof comment ${existing_id} on PR #${PR_NUMBER}"
else
	echo "$payload" | gh api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --input -
	echo "Posted visual-proof comment on PR #${PR_NUMBER}"
fi
