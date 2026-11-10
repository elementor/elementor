#!/bin/bash
set -euo pipefail

echo "Testing Jira release URL resolver logic"
echo "========================================"
echo

MOCK_VERSIONS_JSON='[
  {"id": "26580", "name": "v4.4.0 - GA"},
  {"id": "26570", "name": "v4.3.6"},
  {"id": "26560", "name": "v4.4.0 - Beta 2"},
  {"id": "26550", "name": "v4.3.0 - GA"},
  {"id": "26540", "name": "v4.2.2"}
]'

test_version_lookup() {
  local release_version=$1
  local expected_name=$2
  local expected_id=$3
  local description=$4
  
  echo "Test: $description"
  echo "  Input: $release_version"
  
  if [[ "$release_version" =~ ^([0-9]+\.[0-9]+\.[0-9]+)-beta([0-9]+)$ ]]; then
    VERSION_NAME="v${BASH_REMATCH[1]} - Beta ${BASH_REMATCH[2]}"
  else
    VERSION_NAME="v${release_version}"
  fi
  
  VERSION_ID=$(echo "$MOCK_VERSIONS_JSON" | jq -r --arg name "$VERSION_NAME" \
    '[.[] | select(.name == $name)] | first | .id // empty')
  
  if [ -z "$VERSION_ID" ] && [[ ! "$release_version" =~ -beta ]]; then
    VERSION_NAME_GA="v${release_version} - GA"
    VERSION_ID=$(echo "$MOCK_VERSIONS_JSON" | jq -r --arg name "$VERSION_NAME_GA" \
      '[.[] | select(.name == $name)] | first | .id // empty')
    if [ -n "$VERSION_ID" ]; then
      VERSION_NAME="$VERSION_NAME_GA"
    fi
  fi
  
  if [ "$VERSION_NAME" = "$expected_name" ] && [ "$VERSION_ID" = "$expected_id" ]; then
    echo "  ✓ PASS: Resolved to '$VERSION_NAME' (ID: $VERSION_ID)"
  else
    echo "  ✗ FAIL: Expected '$expected_name' (ID: $expected_id), got '$VERSION_NAME' (ID: $VERSION_ID)"
    return 1
  fi
  echo
}

failures=0

test_version_lookup "4.4.0" "v4.4.0 - GA" "26580" "GA release (major.minor.0) - tries 'v4.4.0', falls back to 'v4.4.0 - GA'" || ((failures++))
test_version_lookup "4.3.6" "v4.3.6" "26570" "Patch release - matches plain 'v4.3.6'" || ((failures++))
test_version_lookup "4.4.0-beta2" "v4.4.0 - Beta 2" "26560" "Beta release - matches 'v4.4.0 - Beta 2'" || ((failures++))
test_version_lookup "4.3.0" "v4.3.0 - GA" "26550" "GA release (major.minor.0) - tries 'v4.3.0', falls back to 'v4.3.0 - GA'" || ((failures++))
test_version_lookup "4.2.2" "v4.2.2" "26540" "Patch release - matches plain 'v4.2.2'" || ((failures++))

if [ $failures -eq 0 ]; then
  echo "All tests passed ✓"
  echo
  echo "The fix correctly handles:"
  echo "  • Beta releases: v4.4.0-beta2 → 'v4.4.0 - Beta 2'"
  echo "  • GA releases: v4.4.0 → tries 'v4.4.0', falls back to 'v4.4.0 - GA'"
  echo "  • Patch releases: v4.3.6 → 'v4.3.6' (no fallback needed)"
  exit 0
else
  echo "$failures test(s) failed ✗"
  exit 1
fi
