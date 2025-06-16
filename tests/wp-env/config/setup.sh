#!/bin/bash
if ! wp core is-installed; then
  wp core install \
    --url="http://localhost:8888" \
    --title="Test Site" \
    --admin_user="admin" \
    --admin_password="password" \
    --admin_email="admin@example.com"
fi

set -eox pipefail

wp plugin activate elementor
wp theme activate hello-elementor

# Remove Akismet as it is pre-installed in the Docker image
wp plugin uninstall akismet --deactivate

WP_CLI_CONFIG_PATH=elementor-config/wp-cli.yml wp rewrite structure '/%postname%/' --hard

# Remove the Guttenberg welcome guide popup
wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}'

# Reset editor counter to avoid auto trigger of the checklist popup when entering the editor for the 2nd time
wp option update e_editor_counter 10
wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}'

# Add user meta so the announcement popup will not be displayed - ED-9723
for id in $(wp user list --field=ID)
do wp user meta add "$id" "announcements_user_counter" 999
done

# Enable SVG uploads for tests
wp eval "
\$functions_file = get_template_directory() . '/functions.php';
\$svg_code = '
// Enable SVG uploads for tests
add_filter(\"upload_mimes\", function(\$mimes) {
    \$mimes[\"svg\"] = \"image/svg+xml\";
    return \$mimes;
});
';
file_put_contents(\$functions_file, \$svg_code, FILE_APPEND);
"

wp --user=admin elementor library import-dir /var/www/html/elementor-templates

wp cache flush
wp rewrite flush --hard
wp elementor flush-css

wp plugin install wordpress-importer --activate
wp import /var/www/html/elementor-playwright/sample-data/elementor-floating-buttons.xml --authors=skip --quiet --allow-root
