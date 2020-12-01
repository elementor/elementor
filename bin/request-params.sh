#!/bin/bash -e

# For running this script in local env, you need to install:
# zip archive
# mysql

# Explain usage: $0=<file-path> $1=<db-name> $2=<db-user> $3=<db-pass> $4=[db-host] $5=[wp-version] $6=[debug] $7=[clean-local-env] $8=[test-as-device]

db_name=${1-wordpress_test}
db_user=${2-root5}
db_pass=${3-root}
db_host=${4-localhost}
db_version=${5-latest}

# debug (bool) - determine if running with msg like info|warning|error and etc.
debug=${6-false}

# clean_local_env (bool) (if the value equal to true - run func clean_local_tests_env )
clean_local_env=${7-false}

# test_as_device (string) - image compare run test as device (desktop|tablet|mobile|any other)
test_as_device=${8-desktop}

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

# Set path to directory of sampled image to compare (before compare with percy)
samples_images_dir=${samples_images_dir-/tmp/samples-images}

# Declare an array of files to import for testing (the name of file must be same as the post_name)
files=("page-17" "headings" "buttons")
