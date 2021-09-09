#!/bin/bash
set -eox pipefail

wp theme activate hello-elementor

TEMPLATES_FILE_NAMES=`ls /var/www/html/elementor-templates/*.json`
for TEMPLATE_FILE_NAME in $TEMPLATES_FILE_NAMES
do
   TEMPLATE_NAME=$(basename "$TEMPLATE_FILE_NAME" .json)
   wp elementor library import "/var/www/html/elementor-templates/${TEMPLATE_NAME}.json" --user="admin"
   TEMPLATE_ID=$(wp db query "SELECT id FROM wp_posts WHERE post_name='${TEMPLATE_NAME}' ORDER BY 'id' ASC LIMIT 1;" --skip-column-names --silent)
   wp db query "UPDATE wp_posts SET post_type='page' WHERE id=${TEMPLATE_ID};"
done

WP_CLI_CONFIG_PATH=elementor-config/wp-cli.yml wp rewrite structure \"/%postname%/\" --hard
wp elementor flush-css
wp post list --post_type=page
