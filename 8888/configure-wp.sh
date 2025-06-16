#!/bin/bash
set -eox pipefail

wp core install --url="http://localhost:8888" --title="test" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email
wp config set ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS true --raw
wp config set SCRIPT_DEBUG false --raw
wp config set WP_DEBUG false --raw