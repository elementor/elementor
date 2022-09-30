#!/bin/bash

bash "${GITHUB_WORKSPACE}/.github/scripts/set-git-user.sh"

npm i semver@7.3.4 --no-package-lock --no-save
PACKAGE_VERSION=$(node -p "require('./package.json').version")
NEXT_PACKAGE_VERSION=$(npx semver $PACKAGE_VERSION -i minor)
NEXT_RELEASE_BRANCH="release/${NEXT_PACKAGE_VERSION}"

git checkout "${NEXT_RELEASE_BRANCH}"
if [ $? -eq 0 ]; then
	git merge origin/develop
	git push
	git checkout developer-edition
	git merge "${NEXT_RELEASE_BRANCH}"
	git push
	echo "NEXT_RELEASE_BRANCH=${NEXT_RELEASE_BRANCH}" >> $GITHUB_ENV
else
	git checkout developer-edition
	git merge origin/develop
	git push
fi
