#!/usr/bin/env bash
set -euo pipefail

PLAYWRIGHT_MAIN_LAST_RUN="tests/playwright/test-results/.last-run.json"
ELEMENTS_REGRESSION_LAST_RUN="tests/elements-regression/test-results/.last-run.json"
STAGING_DIR=".github/artifacts/playwright-last-run"

resolve_last_run_target_dir() {
	local shard_index="$1"
	case "$shard_index" in
		elements-regression-core | elements-regression-atomic)
			echo "tests/elements-regression/test-results"
			;;
		*)
			echo "tests/playwright/test-results"
			;;
	esac
}

stage_last_run_for_upload() {
	mkdir -p "$STAGING_DIR"
	rm -f "$STAGING_DIR/.last-run.json"

	if [[ -f "$PLAYWRIGHT_MAIN_LAST_RUN" ]]; then
		cp "$PLAYWRIGHT_MAIN_LAST_RUN" "$STAGING_DIR/.last-run.json"
	elif [[ -f "$ELEMENTS_REGRESSION_LAST_RUN" ]]; then
		cp "$ELEMENTS_REGRESSION_LAST_RUN" "$STAGING_DIR/.last-run.json"
	else
		echo "No Playwright .last-run.json found for this shard; skipping last-run artifact."
		exit 0
	fi
}

restore_last_run_for_rerun() {
	local shard_index="$1"

	if [[ ! -f "$STAGING_DIR/.last-run.json" ]]; then
		echo "Last-run artifact is missing; this shard will run the full test selection."
		return 1
	fi

	local target_dir
	target_dir="$( resolve_last_run_target_dir "$shard_index" )"
	mkdir -p "$target_dir"
	cp "$STAGING_DIR/.last-run.json" "$target_dir/.last-run.json"
	echo "Restored Playwright last-run state to $target_dir/.last-run.json"
}

usage() {
	echo "Usage: $0 stage-for-upload | restore-for-rerun <shard-index>" >&2
	exit 1
}

command="${1:-}"
case "$command" in
	stage-for-upload)
		stage_last_run_for_upload
		;;
	restore-for-rerun)
		[[ $# -ge 2 ]] || usage
		restore_last_run_for_rerun "$2"
		;;
	*)
		usage
		;;
esac
