#!/bin/bash
set -eo pipefail

bash "${GITHUB_WORKSPACE}/.github/scripts/set-git-user.sh"

echo "Trying to install semver"

npm i semver@7.3.4 --no-package-lock --no-save
PACKAGE_VERSION=$(node -p "require('./package.json').version")
NEXT_PACKAGE_VERSION=$(npx semver $PACKAGE_VERSION -i minor)
NEXT_RELEASE_BRANCH="release/${NEXT_PACKAGE_VERSION}"

NEXT_NEXT_PACKAGE_VERSION=$(npx semver $NEXT_PACKAGE_VERSION -i minor)
NEXT_NEXT_RELEASE_BRANCH="release/${NEXT_NEXT_PACKAGE_VERSION}"

SEPARATOR="\n=====\n\n"

# Merge master -> develop
echo "Merging master -> develop"
git checkout develop
git merge origin/master
git push origin develop

# Merge develop -> next release
echo -e "${SEPARATOR}Merging develop -> next release ${NEXT_RELEASE_BRANCH}"
git checkout "${NEXT_RELEASE_BRANCH}"
git merge origin/develop
git push origin "${NEXT_RELEASE_BRANCH}"

# Merge next release -> next next release
echo -e "${SEPARATOR}Merging next release ${NEXT_RELEASE_BRANCH} -> next next release ${NEXT_NEXT_RELEASE_BRANCH}"
set +e
bash -e <<TRY
  git checkout "${NEXT_NEXT_RELEASE_BRANCH}"
  git merge "${NEXT_RELEASE_BRANCH}"
  git push origin "${NEXT_NEXT_RELEASE_BRANCH}"
TRY
if [ $? -ne 0 ]; then
  echo "branch next next doesn't exist ${NEXT_NEXT_RELEASE_BRANCH}"
fi
set -e

# Merge next next release -> developer-edition
echo -e "${SEPARATOR}Merging next next release ${NEXT_NEXT_RELEASE_BRANCH} -> developer-edition"
git checkout developer-edition
git merge "${NEXT_NEXT_RELEASE_BRANCH}"
git push origin developer-edition

#echo "NEXT_RELEASE_BRANCH=${NEXT_RELEASE_BRANCH}" >> $GITHUB_ENV
