#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive
# mysql

#if [ $# -lt 3 ]; then
#	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [debug] [clean-local-env] [test-as-device]"
#	exit 1
#fi

DB_NAME=${1-wordpress_test}
DB_USER=${2-root}
DB_PASS=${3-root}
DB_HOST=${4-localhost}
WP_VERSION=${5-latest}

# DEBUG (bool) - determine if running with msg like info|warning|error and etc.
DEBUG=${6-false}

# CLEAN_LOCAL_TESTS_ENV (bool) (if the value equal to true - run func clean_local_tests_env )
CLEAN_LOCAL_ENV=${7-false}

# TEST_AS_DEVICE (string) - image compare run test as device (desktop|tablet|mobile|any other)
TEST_AS_DEVICE=${8-desktop}

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

# Set path to directory of sampled image to compare (before compare with percy)
SAMPLES_IMAGES_DIR=${SAMPLES_IMAGES_DIR-/tmp/samples-images}

# Declare an array of files for testing (the name of file must be same as the post_name)
FILES=("page-17" "headings" "buttons")
