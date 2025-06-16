#!/bin/bash
set -eox pipefail

wp core install --url="http://localhost:8888" --title="test" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email
wp config set ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS true --raw
wp config set SCRIPT_DEBUG false --raw
wp config set WP_DEBUG false --raw

# Enable SVG uploads for tests by adding to theme functions.php
wp eval "
\$functions_file = get_template_directory() . '/functions.php';
\$svg_code = '<?php
// Enable SVG uploads for tests
add_filter(\"upload_mimes\", function(\$mimes) {
    \$mimes[\"svg\"] = \"image/svg+xml\";
    return \$mimes;
});
';
file_put_contents(\$functions_file, \$svg_code, FILE_APPEND);
"