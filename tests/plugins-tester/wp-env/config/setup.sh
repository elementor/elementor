#!/bin/bash
set -eox pipefail

wp theme activate hello-elementor
wp --user=admin elementor library import-dir /var/www/html/elementor-templates
WP_CLI_CONFIG_PATH=elementor-config/wp-cli.yml wp rewrite structure \"/%postname%/\" --hard
wp cache flush
wp rewrite flush --hard
wp elementor flush-css
wp post list --post_type=page
wp option update blogname "elementor"
