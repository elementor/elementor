#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

PLUGIN_ZIP_FILENAME="elementor-${PACKAGE_VERSION}.zip"
npx grunt build
mv build elementor
zip -r $PLUGIN_ZIP_FILENAME elementor
echo "PLUGIN_ZIP_FILENAME=${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
