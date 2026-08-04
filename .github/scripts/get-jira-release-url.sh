#!/bin/bash
set -uo pipefail

JIRA_PROJECT_KEY="${JIRA_PROJECT_KEY:-ED}"
JIRA_SITE_URL="${JIRA_SITE_URL:-https://elementor.atlassian.net}"

skip() {
  echo "::warning::$1 Skipping Jira release link."
  echo "jira_release_url=" >> "$GITHUB_OUTPUT"
  exit 0
}

# Beta releases have no corresponding Jira fixVersion/release notes.
if [ "$CHANNEL" != "ga" ]; then
  echo "jira_release_url=" >> "$GITHUB_OUTPUT"
  exit 0
fi

if [ -z "${JIRA_API_EMAIL:-}" ] || [ -z "${JIRA_API_TOKEN:-}" ]; then
  skip "JIRA_API_EMAIL/JIRA_API_TOKEN not set."
fi

# GA fixVersions are named "v<version>" (e.g. "v4.2.2" for release 4.2.2).
VERSION_NAME="v${RELEASE_VERSION}"

VERSIONS_RESPONSE=$(curl -s --write-out '\n%{http_code}' \
  -u "${JIRA_API_EMAIL}:${JIRA_API_TOKEN}" \
  "${JIRA_SITE_URL}/rest/api/3/project/${JIRA_PROJECT_KEY}/versions")
VERSIONS_HTTP_CODE=$(echo "$VERSIONS_RESPONSE" | tail -n1)
VERSIONS_JSON=$(echo "$VERSIONS_RESPONSE" | sed '$d')

if [ "$VERSIONS_HTTP_CODE" != "200" ]; then
  skip "Fetching Jira versions for project ${JIRA_PROJECT_KEY} returned HTTP ${VERSIONS_HTTP_CODE}: ${VERSIONS_JSON:0:300}"
fi

VERSION_ID=$(echo "$VERSIONS_JSON" | jq -r --arg name "$VERSION_NAME" \
  '[.[] | select(.name == $name)] | first | .id // empty')

if [ -z "$VERSION_ID" ]; then
  skip "No Jira fixVersion named '${VERSION_NAME}' found in project ${JIRA_PROJECT_KEY}."
fi

echo "jira_release_url=${JIRA_SITE_URL}/projects/${JIRA_PROJECT_KEY}/versions/${VERSION_ID}/tab/release-report-all-issues" >> "$GITHUB_OUTPUT"
