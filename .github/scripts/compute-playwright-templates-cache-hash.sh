#!/usr/bin/env bash
set -euo pipefail

output_name="${1:-templates_cache_hash}"

search_roots=(
	tests/playwright/.playwright-wp-lite-env.json
	tests/wp-env/config
	tests/playwright/templates
	tests/playwright/mu-plugins
	tests/elements-regression/playwright.config.ts
	tests/playwright/playwright.config.ts
	package.json
	.github/actions/setup-playwright-env
	.github/actions/restore-dependencies-cache
	.github/actions/playwright-bootstrap-cache-save
	.github/actions/playwright-bootstrap-cache-restore
	.github/scripts/compute-playwright-templates-cache-hash.sh
)

file_list=$(find "${search_roots[@]}" -type f 2>/dev/null | sort)

if [ -z "$file_list" ]; then
	echo "No files matched Playwright templates cache inputs" >&2
	exit 1
fi

hash=$(echo "$file_list" | xargs sha256sum | sha256sum | awk '{print $1}')

echo "${output_name}=${hash}" >> "${GITHUB_OUTPUT}"
