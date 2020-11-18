#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive (for mac users "brew install zip")
# mysql (for mac users https://flaviocopes.com/mysql-how-to-install/)

if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [test-type]"
	exit 1
fi

DB_NAME=$1
DB_USER=$2
DB_PASS=$3
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}

# TEST_TYPE decided which test to run. (the value need to includes string: "phpunit" or "imgcomp" else the tests functions doesn't run)
TEST_TYPE=$6

# Set default WP_VERSION (if WP_VERSION string is null, that is, has zero length)
if [ -z $WP_VERSION ] ; then
    WP_VERSION=latest
fi

# Set WP params for settings
#locale=(he_IL en_AU en_CA en_NZ en_ZA en_GB en_US)
WP_LOCALE="en_GB"
WP_USER="test"
WP_USER_PASS="test"
WP_USER_EMAIL="user@example.org"
WP_SITE_NAME="test"
WP_THEMES="hello-elementor"
WP_PLUGINS="elementor"

# Save the current working directory in an environment variable.
INITIAL_WORKING_DIRECTORY=$(pwd)
echo "$INITIAL_WORKING_DIRECTORY"

# Set paths to directories where you will want to install: wp-cli | wp | wp test suit
WP_TESTS_DIR=${WP_TESTS_DIR-/tmp/wordpress-tests-lib}
WP_CORE_DIR=${WP_CORE_DIR-/tmp/wordpress/}

# Set paths to current plugins and them tests directories
CURRENT_PLUGIN="${WP_CORE_DIR}wp-content/plugins/elementor"
CURRENT_PLUGIN_TEST_DIR="${CURRENT_PLUGIN}/tests"

# Import like source config.sh
. $(dirname "$0")/test-functions.sh

decided_which_test_run(){
	if [ -z "$TEST_TYPE" ]; then
		return;
	fi

	case $TEST_TYPE in

  phpunit)
    phpunit_test
    ;;

  imgcomp)
    img_comp_test
    ;;

  *)
    return
    ;;
esac
}

phpunit_test(){
	# The below functions running basic test
	install_wp_cli
	download_wp_core
	config
	install
	install_test_suite
	install_plugins
	install_themes
}

img_comp_test(){
	phpunit_test
	# here add more functions to the basic test
}

# The below functions are usable only for clean local env when running tests
#delete_db
#delete_symlink
#delete_the_installed_directories
#wp_cli_cache_clear
