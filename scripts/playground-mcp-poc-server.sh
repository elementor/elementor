#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="${PLAYGROUND_DATA_DIR:-$ROOT/.playground-mcp-poc-data}"
mkdir -p "$DATA_DIR"
exec npx -y @wp-playground/cli@3.1.58 server \
	--workers=1 \
	--port=9400 \
	--mount="$ROOT:/wordpress/wp-content/plugins/elementor" \
	--mount="$DATA_DIR:/wordpress/wp-content/playground-persist" \
	--blueprint="$ROOT/tests/playground/blueprints/mcp-abilities-poc.json" \
	--blueprint-may-read-adjacent-files
