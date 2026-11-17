#!/bin/bash
set -euo pipefail

VERSION_PATTERN='^[0-9]+\.[0-9]+\.[0-9]+$'
NEW_STABLE_LINE_PATTERN='^[0-9]+\.[0-9]+\.0$'
REPO_NAME_PATTERN='^[A-Za-z0-9._-]+$'

read_branch_version() {
  local branch="$1"
  git fetch --no-tags origin "$branch"
  git show "origin/${branch}:package.json" | jq -r '.version // empty'
}

require_version() {
  local label="$1"
  local value="$2"
  if ! echo "$value" | grep -qE "$VERSION_PATTERN"; then
    echo "::warning::Invalid ${label}: ${value}. Skipping Slack announcement."
    exit 0
  fi
}

if [ "${EVENT:-}" != "stable-release" ]; then
  echo "::warning::Unknown EVENT: ${EVENT:-}. Skipping Slack announcement."
  exit 0
fi

if [ "${DRY_RUN:-false}" != "true" ] && [ -z "${SLACK_CHANNEL_BRANCH_OUT:-}" ]; then
  echo "::warning::SLACK_CHANNEL_BRANCH_OUT is not set. Skipping Slack announcement."
  exit 0
fi

if ! echo "${REPO_NAME:-}" | grep -qE "$REPO_NAME_PATTERN"; then
  echo "::warning::Invalid REPO_NAME: ${REPO_NAME:-}. Skipping Slack announcement."
  exit 0
fi

if ! echo "${STABLE_VERSION:-}" | grep -qE "$NEW_STABLE_LINE_PATTERN"; then
  echo "Stable version ${STABLE_VERSION:-} is not a new version line. Skipping branch-structure announcement."
  exit 0
fi

if [ -z "${BETA_VERSION:-}" ]; then
  BETA_VERSION="$(read_branch_version release/beta)"
fi
if [ -z "${MAIN_VERSION:-}" ]; then
  MAIN_VERSION="$(read_branch_version main)"
fi

require_version "STABLE_VERSION" "$STABLE_VERSION"
require_version "BETA_VERSION" "$BETA_VERSION"
require_version "MAIN_VERSION" "$MAIN_VERSION"

TEXT="$(cat <<EOF
<!channel>
:rocket: We have just released ${STABLE_VERSION}!

Repo: https://github.com/elementor/${REPO_NAME}

:package: Updated version mapping:
:large_green_circle: release/stable -> ${STABLE_VERSION}
:lock: release/beta -> ${BETA_VERSION} (locked) - No need to push any changes to this branch until the next beta release.
:large_blue_circle: main -> ${MAIN_VERSION}

:bulb: Reminder: As a best practice, always create your initial branch from release/stable to allow the sync branch to do its job and keep changes properly synchronized across branches.
EOF
)"

PAYLOAD="$(jq -c -n --arg text "$TEXT" '{text:$text}')"

if [ "${DRY_RUN:-false}" = "true" ]; then
  echo "$PAYLOAD"
  exit 0
fi

echo "payload=${PAYLOAD}" >> "$GITHUB_OUTPUT"
