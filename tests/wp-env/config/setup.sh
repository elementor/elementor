#!/bin/bash
set -eox pipefail

wp theme activate hello-elementor

wp --user=admin elementor library import-dir /var/www/html/elementor-templates

WP_CLI_CONFIG_PATH=elementor-config/wp-cli.yml wp rewrite structure \"/%postname%/\" --hard

wp elementor flush-css

wp post list --post_type=page

# Remove the Guttenberg welcome guide popup
wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{s:26:\"isComplementaryAreaVisible\";b:1;s:12:\"welcomeGuide\";b:0;}s:9:\"_modified\";s:24:\"2022-11-21T10:38:46.200Z\";}'