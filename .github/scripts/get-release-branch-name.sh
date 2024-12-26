#!/bin/bash
set -eo pipefail

if [ -z "$INPUT_VERSION" ];
then
	PACKAGE_VERSION=$(node -p "require('./package.json').version")
	pnpm add -g semver@7.3.4
	NEXT_PACKAGE_VERSION=$(pnpm exec semver $PACKAGE_VERSION -i minor)
	RELEASE_BRANCH="release/${NEXT_PACKAGE_VERSION}"
else
	echo "Version var is set to ${INPUT_VERSION}"
	RELEASE_BRANCH="release/${INPUT_VERSION}"
fi
echo "RELEASE_BRANCH=${RELEASE_BRANCH}" >> $GITHUB_ENV
