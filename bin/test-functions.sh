#!/bin/bash -e

#############################################################################################
#### When used the below functions, please follow after the order of process functions ####
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

	print_msg $(wp --info)
}

download_wp_core() {
	cd "$wp_core_dir"
	# Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
	wp core download --locale="$wp_locale" --version="$wp_version" --skip-plugins
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

get_installed_wp_version() {
	if [[ $wp_version =~ [0-9]+\.[0-9]+(\.[0-9]+)? ]]; then
		WP_TESTS_TAG="tags/$wp_version"
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
	# For switch to mysqli, put define( 'WP_USE_EXT_MYSQL', false ); in wp-config and WP core will use mysqli without any plugin.
	download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php $wp_core_dir/wp-content/db.php

	get_installed_wp_version
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


#############################################################################################
####################### The Below Functions Clean The Local Tests Env #######################
#############################################################################################

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
