#!/bin/bash
set -uo pipefail

JIRA_PROJECT_KEY="${JIRA_PROJECT_KEY:-ED}"
JIRA_SITE_URL="${JIRA_SITE_URL:-https://elementor.atlassian.net}"
JIRA_BETA_VERSION_PREFIX="${JIRA_BETA_VERSION_PREFIX:-}"
CURL_CONNECT_TIMEOUT_SECONDS=10
CURL_MAX_TIME_SECONDS=30

skip() {
  echo "::warning::$1 Skipping Jira release link."
  echo "jira_release_url=" >> "$GITHUB_OUTPUT"
  exit 0
}

if [ -z "${JIRA_API_EMAIL:-}" ] || [ -z "${JIRA_API_TOKEN:-}" ]; then
  skip "JIRA_API_EMAIL/JIRA_API_TOKEN not set."
fi

# GA fixVersions are named "v<version>" (e.g. "v4.2.2" for release 4.2.2).
# Beta fixVersions are named "<prefix>v<version> - Beta <n>" (e.g. "v4.3.0 - Beta 1",
# or "Pro v4.3.0 - Beta 1" for Elementor Pro).
if [[ "$RELEASE_VERSION" =~ ^([0-9]+\.[0-9]+\.[0-9]+)-beta([0-9]+)$ ]]; then
  VERSION_NAME="${JIRA_BETA_VERSION_PREFIX}v${BASH_REMATCH[1]} - Beta ${BASH_REMATCH[2]}"
else
  VERSION_NAME="v${RELEASE_VERSION}"
fi

VERSIONS_RESPONSE=$(curl -s --write-out '\n%{http_code}' \
  --connect-timeout "$CURL_CONNECT_TIMEOUT_SECONDS" --max-time "$CURL_MAX_TIME_SECONDS" \
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
