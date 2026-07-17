#!/usr/bin/env bash
#
# Guards the assumptions behind composer.json's config.policy.advisories.ignore-id
# list for Twig.
#
# Matches are confirmed against comment-stripped file contents (see
# strip-comments.php) so docblocks/comments that merely mention one of these
# APIs by name (e.g. to explain why the code is safe) don't false-positive.
#
# If a change trips one of these checks, either remove the usage or, if it's
# genuinely needed, re-evaluate composer.json's ignore-id list (and the CVEs
# behind it) before relaxing this script.
#
# Usage:
#   bin/check-twig-safety.sh              # scan the whole repo (used in CI)
#   bin/check-twig-safety.sh file1 file2  # scan only these files (used by lint-staged)

set -euo pipefail

cd "$(dirname "$0")/.."

FILES=("$@")

EXCLUDES=(
	--exclude-dir=vendor
	--exclude-dir=vendor_prefixed
	--exclude-dir=node_modules
	--exclude-dir=.git
	--exclude-dir=build
)

failures=0

has_extension() {
	local file="$1"
	shift

	local ext
	for ext in "$@"; do
		[[ "${file}" == *".${ext}" ]] && return 0
	done

	return 1
}

# Candidate files: a cheap raw grep (no comment-stripping) over the relevant
# extensions, just to narrow down which files are worth the (more expensive)
# comment-aware check below.
candidate_files() {
	local pattern="$1"
	shift
	local extensions=("$@")

	if [ "${#FILES[@]}" -eq 0 ]; then
		local includes=()
		local ext
		for ext in "${extensions[@]}"; do
			includes+=(--include="*.${ext}")
		done
		grep -rlEI "${EXCLUDES[@]}" "${includes[@]}" -e "${pattern}" . 2>/dev/null | sed 's#^\./##' || true
	else
		local f
		for f in "${FILES[@]}"; do
			if [ -f "${f}" ] && has_extension "${f}" "${extensions[@]}"; then
				printf '%s\n' "${f}"
			fi
		done
	fi
}

check() {
	local advisories="$1"
	local description="$2"
	local pattern="$3"
	shift 3
	local extensions=("$@")

	local file
	while IFS= read -r file; do
		[ -n "${file}" ] || continue

		local match
		match=$(php bin/strip-comments.php "${file}" | grep -nE -e "${pattern}" || true)

		if [ -n "${match}" ]; then
			echo "::error::Forbidden Twig usage detected (${advisories} - ${description})"
			while IFS= read -r line; do
				echo "${file}:${line}"
			done <<< "${match}"
			echo
			failures=$((failures + 1))
		fi
	done < <(candidate_files "${pattern}" "${extensions[@]}")
}

check "PKSA-8zx5-v2nz-58pb, PKSA-kvv6-36cr-fkzb, PKSA-n14z-jjjg-g8vd, PKSA-3mcc-k66d-pydb, PKSA-dpx1-78wg-1kqs, PKSA-g9zw-qxh8-pq8w, PKSA-yd6k-t2gh-1m43, PKSA-1tmc-rt7x-12w6, PKSA-xx6c-6d96-db2w" \
	"Twig sandbox must stay disabled" \
	'enableSandbox|SandboxExtension|\{%[[:space:]]*sandbox' \
	php twig

check "PKSA-gw7n-z4yx-7xjt, PKSA-21g2-dzjv-sky5, PKSA-fbvq-z33h-r2np" \
	"Twig SourcePolicy must stay unconfigured" \
	'SourcePolicyInterface|setSourcePolicy|new[[:space:]]+SourcePolicy' \
	php

check "PKSA-sjvz-tbbr-vwth" \
	"Twig 'spaceless' filter/tag must not be used in templates" \
	'\{%[[:space:]]*spaceless|\bspaceless\(' \
	twig php

check "PKSA-h8hf-ytnd-5t9q" \
	"Twig {% use %} must only reference hardcoded, quoted template names" \
	'\{%[[:space:]]*use[[:space:]]+[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*%\}' \
	twig

check "PKSA-wwb1-81rc-pd65" \
	"Twig profiler/HtmlDumper must not be used" \
	'HtmlDumper|ProfilerExtension|Twig\\\\Profiler' \
	php

check "PKSA-21g2-dzjv-sky5" \
	"template_from_string() must not be called" \
	'template_from_string' \
	php twig

if [ "${failures}" -gt 0 ]; then
	echo "One or more Twig usages violate the assumptions used to ignore advisories in composer.json (config.policy.advisories.ignore-id)."
	echo "Either remove the usage, or re-evaluate the ignored advisories before relaxing bin/check-twig-safety.sh."
	exit 1
fi

echo "Twig safety check passed."
