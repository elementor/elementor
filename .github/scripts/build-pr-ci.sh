#!/bin/bash
set -eo pipefail

if [[ -z "$PACKAGE_VERSION" ]]; then
	echo "Missing PACKAGE_VERSION env var"
	exit 1
fi

PLUGIN_ZIP_FILENAME="elementor-${PACKAGE_VERSION}.zip"

if [[ -n "$MIXPANEL_TOKEN" ]]; then
	echo "Injecting Mixpanel token."
	MIXPANEL_TOKEN="$MIXPANEL_TOKEN" php <<'PHP'
<?php
$token = getenv( 'MIXPANEL_TOKEN' );
$file = 'elementor.php';
$content = file_get_contents( $file );
$search = "define( 'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN', '' );";
$replacement = 'define( \'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN\', ' . var_export( $token, true ) . ' );';
$content = str_replace( $search, $replacement, $content );
file_put_contents( $file, $content );
PHP
	echo "Mixpanel token injected successfully."
else
	echo "Warning: MIXPANEL_TOKEN not found."
fi

npm run build:ci
npx grunt copy
mv build elementor

zip -r $PLUGIN_ZIP_FILENAME elementor

echo "PLUGIN_ZIP_FILENAME=${PLUGIN_ZIP_FILENAME}" >> $GITHUB_ENV
echo "PLUGIN_ZIP_PATH=./elementor/**/*" >> $GITHUB_ENV
