#!/bin/bash

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

bash "${GITHUB_WORKSPACE}/.github/scripts/set-git-user.sh"

echo "Create tag v${PACKAGE_VERSION}"
git tag "v${PACKAGE_VERSION}"
git push origin "v${PACKAGE_VERSION}"
