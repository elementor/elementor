#!/usr/bin/env bash
set -euo pipefail

# Upload PNGs to ci/visual-proof-assets and comment on the PR.
# Modeled on Angie videoproof/post-comment.sh (inline images via raw git URLs).

ARTIFACTS_DIR="${VISUAL_PROOF_OUT_DIR:-visual-proof-shots}"
MARKER="<!-- visual-proof-ci -->"
ASSETS_BRANCH="ci/visual-proof-assets"
MAX_SHOTS="${VISUAL_PROOF_MAX_SHOTS:-6}"
MAX_VIDEO_BYTES="${VISUAL_PROOF_MAX_VIDEO_BYTES:-40000000}"

log() {
	echo "[visual-proof:comment] $*"
}

err() {
	echo "[visual-proof:comment] $*" >&2
}

gh_api() {
	local err_file
	err_file=$(mktemp)
	if ! gh api "$@" 2>"$err_file"; then
		err "gh api failed: $*"
		err "$(cat "$err_file")"
		rm -f "$err_file"
		return 1
	fi
	rm -f "$err_file"
}

require_env() {
	local name="$1"
	if [[ -z "${!name:-}" ]]; then
		err "${name} is required"
		exit 1
	fi
}

require_env GITHUB_REPOSITORY
require_env GITHUB_SERVER_URL
require_env GITHUB_RUN_ID
require_env PR_NUMBER

run_url="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

log "step=start PR_NUMBER=${PR_NUMBER} assets_branch=${ASSETS_BRANCH} ARTIFACTS_DIR=${ARTIFACTS_DIR}"

png_count=0
if [[ -d "$ARTIFACTS_DIR" ]]; then
	png_count=$(find "$ARTIFACTS_DIR" -type f -name '*.png' | wc -l | tr -d ' ')
fi
log "step=scan png_count=${png_count}"

if [[ ! -d "$ARTIFACTS_DIR" ]] || [[ -z "$(find "$ARTIFACTS_DIR" -type f -name '*.png' -print -quit)" ]]; then
	log "No PNG shots in ${ARTIFACTS_DIR}; skipping comment"
	exit 0
fi

ensure_assets_branch() {
	if gh_api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${ASSETS_BRANCH}" &>/dev/null; then
		log "step=assets-branch exists=${ASSETS_BRANCH}"
		return 0
	fi
	log "step=assets-branch creating ${ASSETS_BRANCH}"
	local default_branch base_sha
	default_branch=$(gh_api "repos/${GITHUB_REPOSITORY}" --jq .default_branch)
	base_sha=$(gh_api "repos/${GITHUB_REPOSITORY}/git/ref/heads/${default_branch}" --jq .object.sha)
	gh_api "repos/${GITHUB_REPOSITORY}/git/refs" \
		-f ref="refs/heads/${ASSETS_BRANCH}" \
		-f sha="${base_sha}" >/dev/null
}

upload_blob() {
	local local_path="$1"
	local repo_path="$2"
	local message="$3"
	local b64_file payload_file

	b64_file=$(mktemp)
	payload_file=$(mktemp)
	base64 -w 0 "$local_path" >"$b64_file"
	jq -n \
		--arg message "$message" \
		--arg branch "${ASSETS_BRANCH}" \
		--rawfile content "$b64_file" \
		'{message: $message, content: $content, branch: $branch}' >"$payload_file"
	if ! gh_api "repos/${GITHUB_REPOSITORY}/contents/${repo_path}" -X PUT --input "$payload_file" >/dev/null; then
		rm -f "$b64_file" "$payload_file"
		return 1
	fi
	rm -f "$b64_file" "$payload_file"
	echo "${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/raw/${ASSETS_BRANCH}/${repo_path}"
}

log "step=assets-branch ensuring ${ASSETS_BRANCH}"
ensure_assets_branch

COMMENT_SECTIONS=()
COMMENT_SECTIONS+=("${MARKER}")
COMMENT_SECTIONS+=("## Visual proof")
COMMENT_SECTIONS+=("")
if [[ "${VISUAL_PROOF_SOURCE:-fallback}" == "actor" ]]; then
	COMMENT_SECTIONS+=("Shots and a short recording from this PR’s Playground preview. A storyboard actor followed **Steps** from the PR’s **Visual proof** section (happy path / Pass). Overlay text includes **Broken**; CI does not recreate the bug.")
else
	COMMENT_SECTIONS+=("Shots and a short recording from this PR’s Playground preview. Generic walk: WP Admin → Pages → Add New → Edit with Elementor (storyboard actor unavailable or produced no shots). Overlay text comes from the PR’s **Visual proof** section.")
fi
COMMENT_SECTIONS+=("")

count=0
while IFS= read -r -d '' file; do
	count=$((count + 1))
	name=$(basename "$file")
	object_path="ci/visual-proof/pr-${PR_NUMBER}/run-${GITHUB_RUN_ID}/${name}"
	log "step=upload-png name=${name}"
	if url=$(upload_blob "$file" "$object_path" "Visual proof shot (PR #${PR_NUMBER}, run ${GITHUB_RUN_ID})"); then
		COMMENT_SECTIONS+=("**${name}**")
		COMMENT_SECTIONS+=("![${name}](${url})")
		COMMENT_SECTIONS+=("")
	fi
	if [[ "$count" -ge "$MAX_SHOTS" ]]; then
		break
	fi
done < <(find "$ARTIFACTS_DIR" -type f -name '*.png' -print0 | sort -z)

video_file=""
if [[ -f "${ARTIFACTS_DIR}/visual-proof.mp4" ]]; then
	video_file="${ARTIFACTS_DIR}/visual-proof.mp4"
elif [[ -f "${ARTIFACTS_DIR}/visual-proof.webm" ]]; then
	video_file="${ARTIFACTS_DIR}/visual-proof.webm"
fi

if [[ -n "$video_file" ]]; then
	video_size=$(wc -c < "$video_file" | tr -d ' ')
	log "step=upload-video file=$(basename "$video_file") bytes=${video_size}"
	if [[ "$video_size" -le "$MAX_VIDEO_BYTES" ]]; then
		vname=$(basename "$video_file")
		vpath="ci/visual-proof/pr-${PR_NUMBER}/run-${GITHUB_RUN_ID}/${vname}"
		if vurl=$(upload_blob "$video_file" "$vpath" "Visual proof video (PR #${PR_NUMBER}, run ${GITHUB_RUN_ID})"); then
			COMMENT_SECTIONS+=("**Recording** ([${vname}](${vurl})) — GitHub may not play this inline; download if needed.")
			COMMENT_SECTIONS+=("")
		fi
	else
		err "step=upload-video skipped (over ${MAX_VIDEO_BYTES} bytes); see workflow artifacts"
	fi
fi

COMMENT_SECTIONS+=("_Also on the [workflow run](${run_url})._")

COMMENT_BODY=$(printf '%s\n' "${COMMENT_SECTIONS[@]}")

log "step=find-comment looking for existing visual-proof-ci marker"
existing_id=$(
	gh_api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --paginate \
		--jq "[.[] | select(.body | contains(\"visual-proof-ci\")) | .id][0] // empty" || true
)

payload=$(jq -n --arg body "$COMMENT_BODY" '{body: $body}')

if [[ -n "${existing_id:-}" && "${existing_id}" != "null" ]]; then
	log "step=upsert mode=update comment_id=${existing_id}"
	echo "$payload" | gh_api "repos/${GITHUB_REPOSITORY}/issues/comments/${existing_id}" -X PATCH --input - >/dev/null
	log "Updated visual-proof comment ${existing_id} on PR #${PR_NUMBER}"
else
	log "step=upsert mode=create"
	echo "$payload" | gh_api "repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments" --input - >/dev/null
	log "Posted visual-proof comment on PR #${PR_NUMBER}"
fi

log "step=done"
