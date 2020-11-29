#!/bin/bash -e

# Import request params
. $(dirname "$0")/request-params.sh

# Import functions (like to write source test-functions.sh)
. $(dirname "$0")/test-functions.sh

# The below functions running phpunit test
install_wp_cli
download_wp_core
config
install
install_test_suite
install_plugins
install_themes

# Decided if clean local env
if [[ -n ${CLEAN_LOCAL_ENV} && ${CLEAN_LOCAL_ENV} == true ]]; then
	clean_local_tests_env
fi
