#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

PLUGIN_ZIP_FILENAME="elementor-${PACKAGE_VERSION}.zip"
npx grunt build
PACKAGE_BASE_DIR="/tmp/elementor-releases/"
PACKAGE_PATH=$(ls $PACKAGE_BASE_DIR)
mv "${PACKAGE_BASE_DIR}/${PACKAGE_PATH}" ${PLUGIN_ZIP_FILENAME}
echo ${PACKAGE_PATH}
echo "PLUGIN_ZIP_FILENAME=${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
echo "PLUGIN_ZIP_PATH=$(pwd)/${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
