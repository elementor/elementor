#!/bin/bash
set -eo pipefail

bash "${GITHUB_WORKSPACE}/.github/scripts/set-git-user.sh"

npm i semver@7.3.4 --no-package-lock --no-save
PACKAGE_VERSION=$(node -p "require('./package.json').version")
NEXT_PACKAGE_VERSION=$(npx semver $PACKAGE_VERSION -i minor)
NEXT_RELEASE_BRANCH="release/${NEXT_PACKAGE_VERSION}"

# Merge master -> develop
git checkout develop
git merge origin/master
git push origin develop

# Merge develop -> next release
git checkout "${NEXT_RELEASE_BRANCH}"
git merge origin/develop
git push origin "${NEXT_RELEASE_BRANCH}"

# Merge next release -> developer-edition
git checkout developer-edition
git merge "${NEXT_RELEASE_BRANCH}"
git push origin developer-edition

echo "NEXT_RELEASE_BRANCH=${NEXT_RELEASE_BRANCH}" >> $GITHUB_ENV
