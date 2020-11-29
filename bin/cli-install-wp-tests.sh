#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive
# mysql

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [test-type] [clean-local-env]"
	exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASS=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}

# TEST_TYPE (string) decided which test to run. (the value need to includes string: "phpunit" or "image-compare" else the tests functions doesn't run)
TEST_TYPE=$6

# CLEAN_LOCAL_TESTS_ENV (bool) (if the value equal to true - run func clean_local_tests_env )
CLEAN_LOCAL_ENV=$7

# Set WP params for settings
WP_LOCALE="en_US"
WP_USER="test"
WP_USER_PASS="test"
WP_USER_EMAIL="user@example.org"
WP_SITE_NAME="test"
WP_THEMES="hello-elementor"
WP_PLUGINS="elementor"

# Save the current working directory in an environment variable.
INITIAL_WORKING_DIRECTORY=$(pwd)
echo "$INITIAL_WORKING_DIRECTORY"

# Set paths to directories where to install.
WP_TESTS_DIR=${WP_TESTS_DIR-/tmp/wordpress-tests-lib}
WP_CORE_DIR=${WP_CORE_DIR-/tmp/wordpress/}

# Set paths to current plugins and them tests directories
CURRENT_PLUGIN="elementor"
CURRENT_PLUGIN_DIR="${WP_CORE_DIR}wp-content/plugins/${CURRENT_PLUGIN}"
CURRENT_PLUGIN_TEST_DIR="${CURRENT_PLUGIN_DIR}/tests"

decided_which_test_run() {
	if [ -z "$TEST_TYPE" ]; then
		return
	fi

	case $TEST_TYPE in

	phpunit)
		# Import like source config.sh
		. $(dirname "$0")/run-test-phpunit.sh
		;;

	image-compare)
		# Import like source config.sh
		. $(dirname "$0")/run-test-image-compare.sh
		;;

	*)
		return
		;;
	esac
}

clean_local_tests_env() {
	# The below functions are usable only for clean local env when running tests
	delete_db
	delete_symlink
	delete_the_installed_directories
	wp_cli_cache_clear
}

# Order Running Functions
decided_which_test_run

if [[ -n ${CLEAN_LOCAL_ENV} && ${CLEAN_LOCAL_ENV} == true ]]; then
	clean_local_tests_env
fi
