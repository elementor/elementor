#!/bin/bash
set -eo pipefail

PLUGIN_SLUG="elementor"
MAIN_BRANCH="main"
MAIN_NIGHTLY_TAG="nightly"
NIGHTLY_NOTES_FILENAME="nightly-release-notes.md"

for REQUIRED_VAR in CLEAN_PACKAGE_VERSION PACKAGE_VERSION PLUGIN_ZIP_FILENAME BASE_REF; do
	if [[ -z "${!REQUIRED_VAR}" ]]; then
		echo "Missing ${REQUIRED_VAR} env var"
		exit 1
	fi
done

if [[ "${BASE_REF}" == "${MAIN_BRANCH}" ]]; then
	NIGHTLY_TAG="${MAIN_NIGHTLY_TAG}"
else
	NIGHTLY_TAG="${CLEAN_PACKAGE_VERSION}-nightly"
fi

NIGHTLY_ZIP_FILENAME="${PLUGIN_SLUG}-${NIGHTLY_TAG}.zip"
NIGHTLY_COMMIT=$(git rev-parse HEAD)

cp "${PLUGIN_ZIP_FILENAME}" "${NIGHTLY_ZIP_FILENAME}"

# The tag has to be moved manually because the release action never repoints an existing tag.
git tag --force "${NIGHTLY_TAG}" "${NIGHTLY_COMMIT}"
git push --force origin "refs/tags/${NIGHTLY_TAG}"

printf 'Rolling build of `%s`, replaced on every merge. Not a stable release.\n\n- Build version: `%s`\n- Commit: %s\n- Pull request: [#%s](%s) %s\n' \
	"${BASE_REF}" \
	"${PACKAGE_VERSION}" \
	"${NIGHTLY_COMMIT}" \
	"${PR_NUMBER}" \
	"${PR_URL}" \
	"${PR_TITLE}" \
	> "${NIGHTLY_NOTES_FILENAME}"

{
	echo "NIGHTLY_TAG=${NIGHTLY_TAG}"
	echo "NIGHTLY_RELEASE_NAME=Nightly (${BASE_REF})"
	echo "NIGHTLY_ZIP_FILENAME=${NIGHTLY_ZIP_FILENAME}"
	echo "NIGHTLY_NOTES_FILENAME=${NIGHTLY_NOTES_FILENAME}"
} >> "$GITHUB_ENV"
