#!/bin/bash
# Local daily runner for the release doc generator.
# Uses a fixed anchor ticket (ED-20684) to identify the active fix version.
# Switch to GitHub Actions trigger once ready to merge.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Load credentials
ENV_FILE="$SCRIPT_DIR/.env.release-doc"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Create it with JIRA_* and CONFLUENCE_* vars." >&2
  exit 1
fi
set -a; source "$ENV_FILE"; set +a

# Dummy PR env vars — the script only needs PR_TITLE to extract the ticket key
export PR_TITLE="[ED-20684] Scheduled local run"
export PR_BODY=""
export PR_URL="https://github.com/elementor/elementor/pull/00000"
export PR_NUMBER="00000"

LOG_FILE="$SCRIPT_DIR/release-doc-local.log"
echo "=== $(date) ===" >> "$LOG_FILE"
python3 "$SCRIPT_DIR/update-release-doc.py" 2>&1 | tee -a "$LOG_FILE"
