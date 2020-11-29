#!/bin/bash -e

# Import request params
. $(dirname "$0")/request-params.sh

# Import functions (like to write source test-functions.sh)
. $(dirname "$0")/test-functions.sh

run_build
run_wp_server
test_screenshots
kill_server_process

# Decided if clean local env
if [[ -n ${CLEAN_LOCAL_ENV} && ${CLEAN_LOCAL_ENV} == true ]]; then
	clean_local_tests_env
fi
