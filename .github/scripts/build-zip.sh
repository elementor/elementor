#!/bin/bash
set -eo pipefail

PLUGIN_ZIP_FILENAME="elementor-${PACKAGE_VERSION}.zip"
npx grunt build
mv build elementor
zip -r $PLUGIN_ZIP_FILENAME elementor
echo "PLUGIN_ZIP_FILENAME=${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
echo "PLUGIN_ZIP_PATH=${WORKSPACE}/elementor/**/*" >> $GITHUB_ENV
