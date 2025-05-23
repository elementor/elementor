#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

bash "${GITHUB_WORKSPACE}/.github/scripts/set-git-user.sh"

echo "Commit and push bump version ${PACKAGE_VERSION}"
git commit -am "Bump ${PACKAGE_VERSION}"
git push
