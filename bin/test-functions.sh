#!/bin/bash -e

#############################################################################################
#### When used the below functions, you must follow after the order of process functions ####
############################ And let attention to cd <directory> ############################
#############################################################################################

print_msg() {
	# If debug equal to true - display msg
	if [[ -n ${debug} && ${debug} == true ]]; then
		# Get current date & time
		now=$(date +"%d-%m-%y %H:%M:%S")
		echo "$now [Info] - $1"
	fi
}

download() {
	if [ $(which curl) ]; then
		curl -s "$1" >"$2"
	elif [ $(which wget) ]; then
		wget -nv -O "$2" "$1"
	fi
}

# shellcheck disable=SC2120
parse_command_line_arguments() {
	cd "$initial_working_directory"
#			locale tmp_db_name=$(wp config get DB_NAME)
#			db_name=$([[ -n "$db_name" ]] ? $tmp_db_name : [[ -n "$tmp_db_name" && "$tmp_db_name" != "$db_name" ]] ? "$tmp_db_name" : "$db_name")
#			#			db_name="${1#*=}"
#			;;
#		--db_user=*)
#			locale tmp_db_user=$(wp config get DB_USER)
#			# shellcheck disable=SC2035
#			db_user=$([ -n "${db_user}" ] ? "${1#*=}" : [[ -n "$tmp_db_user" && "$tmp_db_user" != "$db_user" ]] ? "$tmp_db_user" : "$db_user")
#			#			db_user="${1#*=}"


	# You must install wp-cli globally in your local machine else it return error
	if [ -n "$(wp config get DB_USER)" ];then
		db_user=$(wp config get DB_USER)
	fi
	if [ -n "$(wp config get DB_PASSWORD)" ];then
		db_pass=$(wp config get DB_PASSWORD)
	fi
	if [ -n "$(wp config get DB_HOST)" ];then
		db_host=$(wp config get DB_HOST)
	fi

	#	locale tmp_db_name=$(wp config get DB_NAME)
	#	locale tmp_db_user=$(wp config get DB_USER)
	#	locale tmp_db_pass=$(wp config get DB_PASSWORD)
	#	locale tmp_db_host=$(wp config get DB_HOST)

	# Parse Command Line Arguments
	while [ "$#" -gt 0 ]; do
		case "$1" in
		--db_user=*)
			if [ -n "${1#*=}" ];then
				db_user="${1#*=}"
			fi
			;;
		--db_pass=*)
			if [ -n "${1#*=}" ];then
				db_pass="${1#*=}"
			fi
			;;
		--db_host=*)
			if [ -n "${1#*=}" ];then
				db_host="${1#*=}"
			fi
			;;
		--wp_version=*)
			if [ -n "${1#*=}" ];then
				wp_version="${2}"
			fi
			;;
		--debug=*)
			if [ -n "${1#*=}" ];then
				debug="${1#*=}"
			fi
			;;
		--help) print_help ;;
		*)
			printf "***********************************************************\n"
			printf "* Error: Invalid argument, run --help for valid arguments. *\n"
			printf "***********************************************************\n"
			exit 1
			;;
		esac
		shift
	done
}

install_packages_for_images_compare() {
	cd "$wp_core_dir"
	npm i minimist
	npm install -g backstopjs
	#	npm i puppeteer
	# Create directory for save the samples images
	#	if [ ! -d "$samples_images_dir" ]; then
	#		mkdir -p "$samples_images_dir"
	#	fi
}

install_wp_cli() {
	if [ ! -d "$wp_core_dir" ]; then
		mkdir -p "$wp_core_dir"
	fi

	cd "$wp_core_dir"
	# Download and install wp-cli
	curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	# Set the permissions to make it executable
	chmod +x wp-cli.phar
	sudo mv wp-cli.phar /usr/local/bin/wp

	# shellcheck disable=SC2119
	parse_command_line_arguments

	echo "$db_name"
	echo "$db_user"
	echo "$db_pass"
	echo "$db_host"
	print_msg $(wp --info)
}

download_wp_core() {
	cd "$wp_core_dir"
	# Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
	wp core download --locale="$wp_locale" --version="$db_version" --skip-plugins
}

config() {
	# Create the wp-config file
	wp config create --dbname="$db_name" --dbuser="$db_user" --dbpass="$db_pass"
}

install() {
	# Create database
	wp db create

	# Parse db_host for port or socket references
	local PARTS=(${db_host//\:/ })
	local DB_HOSTNAME=${PARTS[0]}
	local DB_SOCK_OR_PORT=${PARTS[1]}
	local EXTRA=""

	if ! [ -z "$DB_HOSTNAME" ]; then
		if [ $(echo "$DB_SOCK_OR_PORT" | grep -e '^[0-9]\{1,\}$') ]; then
			EXTRA="--host=$DB_HOSTNAME --port=$DB_SOCK_OR_PORT --protocol=tcp"
		elif ! [ -z $DB_SOCK_OR_PORT ]; then
			EXTRA="--socket=$DB_SOCK_OR_PORT"
		elif ! [ -z $DB_HOSTNAME ]; then
			EXTRA="--host=$DB_HOSTNAME --protocol=tcp"
		fi
	fi

	# Optimizes the database
	wp db optimize --dbuser="$db_user" --dbpass="$db_pass" "$EXTRA"

	# Install WordPress
	wp core install --url="${db_host}" --title="$wp_site_name" --admin_user="$wp_user" --admin_password="$wp_user_pass" --admin_email="$wp_user_email"

}

get_installed_db_version() {
	if [[ $db_version =~ [0-9]+\.[0-9]+(\.[0-9]+)? ]]; then
		WP_TESTS_TAG="tags/$db_version"
	else
		# Get the latest version of wordpress from core installed
		LATEST_VERSION=$(wp core version)
		if [ -z "$LATEST_VERSION" ]; then
			print_msg "Latest WordPress version could not be found"
			exit 1
		fi
		WP_TESTS_TAG="tags/$LATEST_VERSION"
	fi
}

install_test_suite() {
	# If you want to switch to mysqli you put define( 'WP_USE_EXT_MYSQL', false ); in wp-config and WP core will use mysqli without any plugin.
	download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php $wp_core_dir/wp-content/db.php

	get_installed_db_version
	# Portable in-place argument for both GNU sed and Mac OSX sed
	if [[ $(uname -s) == 'Darwin' ]]; then
		local ioption='-i .bak'
	else
		local ioption='-i'
	fi

	# Set up testing suite if it doesn't yet exist
	if [ ! -d "$wp_tests_dir" ]; then
		# Set up testing suite
		mkdir -p $wp_tests_dir
		svn co --quiet https://develop.svn.wordpress.org/"${WP_TESTS_TAG}"/tests/phpunit/includes/ "${wp_tests_dir}/includes"
	fi

	cd "${wp_tests_dir}"

	if [ ! -f wp-tests-config.php ]; then
		download https://develop.svn.wordpress.org/${WP_TESTS_TAG}/wp-tests-config-sample.php "${wp_tests_dir}/wp-tests-config.php"
		sed $ioption "s:dirname( __FILE__ ) . '/src/':'$wp_core_dir':" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/youremptytestdbnamehere/$db_name/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/yourusernamehere/$db_user/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s/yourpasswordhere/$db_pass/" "$wp_tests_dir"/wp-tests-config.php
		sed $ioption "s|localhost|${db_host}|" "$wp_tests_dir"/wp-tests-config.php
	fi

	# Before finished running install_test_suite - return to directory $wp_core_dir where wp-cli installed
	cd "${wp_core_dir}"
}

create_plugins_folder() {
	if [ ! -d "${wp_core_dir}wp-content/plugins" ]; then
		mkdir "${wp_core_dir}wp-content/plugins"
	fi
}

install_plugins() {
	create_plugins_folder
	# Create symlink to current path
	ln -s "${initial_working_directory}" "${current_plugin_dir}"
	# Install plugins
	wp plugin activate "$wp_plugins"
}

install_themes() {
	# Install the theme
	wp theme install "$wp_themes" --activate
}

import_templates() {
	cd "${wp_core_dir}"
	for file in "${files[@]}"; do
		# Import elementor json template to db
		wp elementor library import "${current_plugin_test_dir}/screenshotter/config/${file}.json" --user="$wp_user"

		local TEMPLATE_ID=$(wp db query "SELECT id FROM wp_posts WHERE post_name='$file' ORDER BY 'id' ASC LIMIT 1;")
		TEMPLATE_ID=${TEMPLATE_ID//[!0-9]/}
		wp db query "UPDATE wp_posts SET post_type='page' WHERE id='${TEMPLATE_ID}';"

		print_msg $(wp db query "SELECT id,post_title,post_name,post_type,post_status,post_date FROM wp_posts WHERE id='${TEMPLATE_ID}';")
	done
}

run_build() {
	cd "$current_plugin_dir"
	npm i grunt-cli
	grunt build
}

run_wp_server() {
	cd "$wp_core_dir"

	# rewrite url structure
	wp rewrite structure '/%postname%/'

	# Launches PHP's built-in web server run on port 80 (for multisite)
	nohup wp server &

	print_msg $(wp db check)
	print_msg $(wp config list)
}

test_screenshots() {
	# The below one command running puppeteer directly
	#	node "${current_plugin_dir}/bin/take-screenshots.js" --url="http://localhost:8080/?p=${TEMPLATE_ID}" --targetPath="${samples_images_dir}" --templateID="${TEMPLATE_ID}" --device=${RUN_AS_DEVICE}

	# The below two command running backstop directly ()
	#	backstop reference --config="${current_plugin_test_dir}/screenshotter/backstop.js"
	backstop test --config="${current_plugin_test_dir}/screenshotter/backstop.js"
}

kill_server_process() {
	killall nohup wp server &
	JOBS=$(jobs -l)
	print_msg "${JOBS}"
	KILL_PID=$(echo ${JOBS//[!0-9]/} | grep -o ....$)
	kill "$KILL_PID"
	print_msg "Killed process (pid) $KILL_PID"
}

#############################################################################################
####################### The Below Functions Clean The Local Tests Env #######################
#############################################################################################

repairs_db() {
	# Repairs the database.
	wp db repair
}

delete_db() {
	# Deletes the existing database.
	wp db drop --yes
}

delete_symlink() {
	# Check if file exists and is a symbolic link (same as -h command)
	if [ -L "${current_plugin_dir}" ]; then
		unlink "${current_plugin_dir}"
		print_msg "The symlink ${current_plugin_dir} is deleted."
	fi
}

delete_the_installed_directories() {
	# Delete the $wp_core_dir directory and all its contents, including any subdirectories and files
	if [ -d "$wp_core_dir" ]; then
		rm -rf "$wp_core_dir"
		if [ ! -d "$wp_core_dir" ]; then
			print_msg "Directory $wp_core_dir is deleted."
		else
			print_msg "Directory $wp_core_dir does not delete."
		fi
	fi

	# Delete the $wp_tests_dir directory and all its contents, including any subdirectories and files
	if [ -d "$wp_tests_dir" ]; then
		rm -rf "$wp_tests_dir"
		if [ ! -d "$wp_tests_dir" ]; then
			print_msg "Directory $wp_tests_dir is deleted."
		else
			print_msg "Directory $wp_tests_dir does not delete."
		fi
	fi

	# Delete the $samples_images_dir directory and all its contents, including any subdirectories and files
	if [ -d "$samples_images_dir" ]; then
		rm -rf "$samples_images_dir"
		if [ ! -d "$samples_images_dir" ]; then
			print_msg "Directory $samples_images_dir is deleted."
		else
			print_msg "Directory $samples_images_dir does not delete."
		fi
	fi
}

wp_cli_cache_clear() {
	# Clears the internal cache
	wp cli cache clear
}

#############################################################################################
################ The Below Function Run Functions Clean The Local Tests Env #################
#############################################################################################

clean_local_tests_env() {
	# The below functions are usable only for clean local env when running tests
	delete_db
	delete_symlink
	delete_the_installed_directories
	wp_cli_cache_clear
}
