#!/bin/bash -e

# Import (like to write source test-functions.sh)
. $(dirname "$0")/test-functions.sh

# The below functions running basic test
install_wp_cli
download_wp_core
config
install
install_plugins
install_themes
import_template

#run_build
#install_wp_server

# here add more functions to the basic test



