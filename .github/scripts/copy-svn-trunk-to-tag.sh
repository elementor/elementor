#!/bin/bash
set -eo pipefail

MAX_ATTEMPTS=3
INITIAL_BACKOFF_SECONDS=10

if [[ -z "$SVN_USERNAME" ]]; then
	echo "Set the SVN_USERNAME env var"
	exit 1
fi

if [[ -z "$SVN_PASSWORD" ]]; then
	echo "Set the SVN_PASSWORD env var"
	exit 1
fi

if [[ -z "$PLUGIN_VERSION" ]]; then
	echo "Set the PLUGIN_VERSION env var"
	exit 1
fi

TRUNK_URL="https://plugins.svn.wordpress.org/elementor/trunk"
TAG_URL="https://plugins.svn.wordpress.org/elementor/tags/${PLUGIN_VERSION}"
SVN_CP_ARGS=(
	--message "Tagged ${PLUGIN_VERSION}"
	--no-auth-cache
	--non-interactive
	--username "$SVN_USERNAME"
	--password "$SVN_PASSWORD"
)

attempt=1
backoff_seconds=$INITIAL_BACKOFF_SECONDS

while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
	echo "Copying SVN trunk to tag (attempt ${attempt}/${MAX_ATTEMPTS})"

	if svn cp "$TRUNK_URL" "$TAG_URL" "${SVN_CP_ARGS[@]}"; then
		exit 0
	fi

	if [ "$attempt" -eq "$MAX_ATTEMPTS" ]; then
		echo "SVN tag copy failed after ${MAX_ATTEMPTS} attempts"
		exit 1
	fi

	echo "SVN tag copy failed; retrying in ${backoff_seconds}s"
	sleep "$backoff_seconds"
	backoff_seconds=$((backoff_seconds * 2))
	attempt=$((attempt + 1))
done
