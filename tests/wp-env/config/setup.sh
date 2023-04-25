#!/bin/bash
set -eox pipefail

wp theme activate hello-elementor

wp --user=admin elementor library import-dir /var/www/html/elementor-templates

WP_CLI_CONFIG_PATH=elementor-config/wp-cli.yml wp rewrite structure \"/%postname%/\" --hard

wp elementor flush-css

wp post list --post_type=page

# Remove the Guttenberg welcome guide popup
wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}'

# Add user meta so the announcement popup will not be displayed - ED-9723
for id in $(wp user list --field=ID)
do wp user meta add "$id" "announcements_user_counter" 999
done
