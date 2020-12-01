#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive
# mysql

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [test-type] [clean-local-env]"
	exit 1
fi

db_name=$1
db_user=$2
db_pass=$3
db_host=${4-localhost}
db_version=${5-latest}

# TEST_TYPE (string) decided which test to run. (the value need to includes string: "phpunit" or "image-compare" else the tests functions doesn't run)
TEST_TYPE=$6

# CLEAN_LOCAL_TESTS_ENV (bool) (if the value equal to true - run func clean_local_tests_env )
clean_local_env=$7

# Set WP params for settings
wp_locale="en_US"
wp_user="test"
wp_user_pass="test"
wp_user_email="user@example.org"
wp_site_name="test"
wp_themes="hello-elementor"
wp_plugins="elementor"

# Save the current working directory in an environment variable.
initial_working_directory=$(pwd)
echo "$initial_working_directory"

# Set paths to directories where to install.
wp_tests_dir=${wp_tests_dir-/tmp/wordpress-tests-lib}
wp_core_dir=${wp_core_dir-/tmp/wordpress/}

# Set paths to current plugins and them tests directories
current_plugin="elementor"
current_plugin_dir="${wp_core_dir}wp-content/plugins/${current_plugin}"
current_plugin_test_dir="${current_plugin_dir}/tests"

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

if [[ -n ${clean_local_env} && ${clean_local_env} == true ]]; then
	clean_local_tests_env
fi
