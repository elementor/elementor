#!/bin/bash -e

# Import request params
. $(dirname "$0")/request-params.sh

# Import functions (like to write source test-functions.sh)
. $(dirname "$0")/test-functions.sh

run_build
run_wp_server
test_screenshots
kill_server_process
