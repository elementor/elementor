#!/bin/bash -e

# Import like source config.sh
. $(dirname "$0")/test-functions.sh

# The below functions running phpunit test
install_wp_cli
download_wp_core
config
install
install_test_suite
install_plugins
install_themes



