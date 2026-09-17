#!/usr/bin/env bash
#
# Fast DB-less PHPUnit for local dev. Runs the given test files with the unit bootstrap
# (no WordPress, no MySQL) and without the project phpunit.xml.
#
# Usage:
#   tests/phpunit/run-unit.sh <test-file> [<test-file> ...] [extra phpunit args]
#
# Examples:
#   tests/phpunit/run-unit.sh tests/phpunit/elementor/modules/atomic-widgets/css-converter/converters/test-string-property-converter.php
#   tests/phpunit/run-unit.sh tests/phpunit/.../test-css-converter.php --filter test_convert
#   tests/phpunit/run-unit.sh tests/phpunit/.../test-css-converter.php tests/phpunit/.../test-converter-registry.php
#
# Anything ending in .php is treated as a test file (added to a generated testsuite, which sidesteps
# PHPUnit's filename<->classname assumption for `test-*.php`). Everything else is passed through to
# PHPUnit (e.g. --filter <pattern>). Only works for tests whose subjects don't call WordPress at
# load/run time; tests needing WordPress/MySQL must use the full suite.

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

files=()
passthrough=()

for arg in "$@"; do
	case "$arg" in
		*.php)
			if [ ! -f "$arg" ]; then
				# Resolve relative to repo root if not found from the current directory.
				arg="$root/$arg"
			fi
			files+=( "$arg" )
			;;
		*)
			passthrough+=( "$arg" )
			;;
	esac
done

if [ "${#files[@]}" -eq 0 ]; then
	echo "Usage: $0 <test-file.php> [<test-file.php> ...] [extra phpunit args]" >&2
	exit 1
fi

config="$(mktemp -t run-unit-XXXXXX.xml)"
trap 'rm -f "$config"' EXIT

{
	echo '<phpunit bootstrap="'"$root"'/tests/phpunit/unit-bootstrap.php" colors="true" failOnWarning="true" failOnRisky="true">'
	echo '	<testsuites>'
	echo '		<testsuite name="unit">'
	for f in "${files[@]}"; do
		abs="$(cd "$(dirname "$f")" && pwd)/$(basename "$f")"
		echo "			<file>${abs}</file>"
	done
	echo '		</testsuite>'
	echo '	</testsuites>'
	echo '</phpunit>'
} > "$config"

exec "$root/vendor/bin/phpunit" -c "$config" "${passthrough[@]}"
