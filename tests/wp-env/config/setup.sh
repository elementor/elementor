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

# Remove Akismet as it is pre-installed in the Docker image (ignore errors if not found)
wp plugin uninstall akismet --deactivate || echo "Akismet plugin not found or already removed"

# Set rewrite structure
wp rewrite structure '/%postname%/' --hard

# Remove the Guttenberg welcome guide popup (ignore errors if already set)
wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}' || echo "Welcome guide preference already set"

# Reset editor counter to avoid auto trigger of the checklist popup when entering the editor for the 2nd time
wp option update e_editor_counter 10
wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}'

# Add user meta so the announcement popup will not be displayed - ED-9723
for id in $(wp user list --field=ID)
do wp user meta add "$id" "announcements_user_counter" 999 || echo "Announcement counter already set for user $id"
done

# Import templates if directory exists
if [ -d "/var/www/html/elementor-templates" ]; then
  wp --user=admin elementor library import-dir /var/www/html/elementor-templates || echo "Template import failed or already imported"
else
  echo "Template directory not found, skipping template import"
fi

wp cache flush
wp rewrite flush --hard
wp elementor flush-css

# Install and activate wordpress-importer (ignore if already installed)
wp plugin install wordpress-importer --activate || echo "WordPress importer already installed"

# Import sample data if file exists
if [ -f "/var/www/html/elementor-playwright/sample-data/elementor-floating-buttons.xml" ]; then
  wp import /var/www/html/elementor-playwright/sample-data/elementor-floating-buttons.xml --authors=skip --quiet --allow-root || echo "Sample data import failed or already imported"
else
  echo "Sample data file not found, skipping sample data import"
fi
