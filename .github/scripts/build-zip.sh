#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

PLUGIN_ZIP_FILENAME="elementor-${PACKAGE_VERSION}.zip"

# Inject Mixpanel token
if [[ -n "$MIXPANEL_TOKEN" ]]; then
	echo "Injecting Mixpanel token."
	sed -i "s/define( 'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN', '' );/define( 'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN', '${MIXPANEL_TOKEN}' );/g" elementor.php
	echo "Mixpanel token injected successfully."
else
	echo "Warning: MIXPANEL_TOKEN not found."
fi

npm run build > build.log 2>&1
mv build elementor

# Make sure not to upload the .zip file to the artifact!
zip -r $PLUGIN_ZIP_FILENAME elementor

echo "PLUGIN_ZIP_FILENAME=${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
echo "PLUGIN_ZIP_PATH=./elementor/**/*" >> $GITHUB_ENV
