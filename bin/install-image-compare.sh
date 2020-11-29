#!/bin/bash -e

# Import request params
. $(dirname "$0")/request-params.sh

# Import functions (like to write source test-functions.sh)
. $(dirname "$0")/test-functions.sh

# The below functions running basic test
install_wp_cli
install_packages_for_images_compare
download_wp_core
config
install
install_plugins
install_themes
