#!/usr/bin/env bash
set -euo pipefail
WIDGET="${1:?usage: playground-mcp-verify-widget.sh <widget-type>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ART="${MCP_VERIFY_ARTIFACTS_ROOT:-/opt/cursor/artifacts}/${WIDGET}"
mkdir -p "$ART"
export MCP_POC_ARTIFACTS="$ART"
export MCP_POC_WIDGET="$WIDGET"
node "$ROOT/scripts/playground-mcp-poc.mjs"
node "$ROOT/scripts/playground-mcp-poc-screenshot.mjs"
echo "Artifacts: $ART/mcp-poc-page-desktop.png $ART/mcp-poc-page-mobile.png"
