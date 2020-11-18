#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive
# mysql


if [ $# -lt 3 ]; then
	echo "usage: $0 <db-name> <db-user> <db-pass> [db-host] [wp-version] [wp-version] [debug] [clean-local-env]"
	exit 1
fi

# Explain usage: $0=<file-path> $1=<db-name> $2=<db-user> $3=<db-pass> $4=[db-host] $5=[wp-version] $6=[debug] $7=[clean-local-env]
# @param db_name ( string) - the db name.
# @param db_user ( string) - the db user.
# @param db_pass ( string) - the db pass.
# @param db_host ( string) - the db host.
# @param wp_version ( string) - the wordpress version.
# @param debug (bool) - determine if running with msg like info|warning|error and etc.
# @param clean_local_env (bool) (if the value equal to true - run func clean_local_tests_env )
db_name=${1-wordpress_test}
db_user=${2-root5}
db_pass=${3-root}
db_host=${4-localhost}
wp_version=${5-latest}
debug=${6-false}
clean_local_env=${7-false}

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

# Set paths to directories where to install.
wp_tests_dir=${wp_tests_dir-/tmp/wordpress-tests-lib}
wp_core_dir=${wp_core_dir-/tmp/wordpress/}

# Set paths to current plugin and tests directories
current_plugin="elementor"
current_plugin_dir="${wp_core_dir}wp-content/plugins/${current_plugin}"
current_plugin_test_dir="${current_plugin_dir}/tests"
