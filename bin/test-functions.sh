#!/bin/bash -e

#############################################################################################
#### When used the below functions, you must follow after the order of process functions ####
############################ And let attention to cd <directory> ############################
#############################################################################################

print_msg() {
	now=$(date +"%d-%m-%y %H:%M:%S")
	echo "$now [Info] - $1"
}

download() {
	if [ $(which curl) ]; then
		curl -s "$1" >"$2"
	elif [ $(which wget) ]; then
		wget -nv -O "$2" "$1"
	fi
}

install_wp_cli() {
	if [ ! -d "$WP_CORE_DIR" ]; then
		mkdir -p "$WP_CORE_DIR"
	fi

	cd "$WP_CORE_DIR"
	# Download and install wp-cli
	curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
	# Set the permissions to make it executable
	chmod +x wp-cli.phar
	sudo mv wp-cli.phar /usr/local/bin/wp
	wp --info
}

download_wp_core() {
	# Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
	wp core download --locale="$WP_LOCALE" --version="$WP_VERSION" --skip-plugins
}

config() {
	# Create the wp-config file
	wp config create --dbname="$DB_NAME" --dbuser="$DB_USER" --dbpass="$DB_PASS"
}

install() {
	# Create database
	wp db create

	# Parse DB_HOST for port or socket references
	local PARTS=(${DB_HOST//\:/ })
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
	wp db optimize --dbuser="$DB_USER" --dbpass="$DB_PASS" "$EXTRA"

	# Install WordPress
	wp core install --url="${DB_HOST}" --title="$WP_SITE_NAME" --admin_user="$WP_USER" --admin_password="$WP_USER_PASS" --admin_email="$WP_USER_EMAIL"

}

get_installed_wp_version() {
	if [[ $WP_VERSION =~ [0-9]+\.[0-9]+(\.[0-9]+)? ]]; then
		WP_TESTS_TAG="tags/$WP_VERSION"
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
	download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php $WP_CORE_DIR/wp-content/db.php

	get_installed_wp_version
	# Portable in-place argument for both GNU sed and Mac OSX sed
	if [[ $(uname -s) == 'Darwin' ]]; then
		local ioption='-i .bak'
	else
		local ioption='-i'
	fi

	# Set up testing suite if it doesn't yet exist
	if [ ! -d "$WP_TESTS_DIR" ]; then
		# Set up testing suite
		mkdir -p $WP_TESTS_DIR
		svn co --quiet https://develop.svn.wordpress.org/"${WP_TESTS_TAG}"/tests/phpunit/includes/ "${WP_TESTS_DIR}/includes"
	fi

	cd "${WP_TESTS_DIR}"

	if [ ! -f wp-tests-config.php ]; then
		download https://develop.svn.wordpress.org/${WP_TESTS_TAG}/wp-tests-config-sample.php "${WP_TESTS_DIR}/wp-tests-config.php"
		sed $ioption "s:dirname( __FILE__ ) . '/src/':'$WP_CORE_DIR':" "$WP_TESTS_DIR"/wp-tests-config.php
		sed $ioption "s/youremptytestdbnamehere/$DB_NAME/" "$WP_TESTS_DIR"/wp-tests-config.php
		sed $ioption "s/yourusernamehere/$DB_USER/" "$WP_TESTS_DIR"/wp-tests-config.php
		sed $ioption "s/yourpasswordhere/$DB_PASS/" "$WP_TESTS_DIR"/wp-tests-config.php
		sed $ioption "s|localhost|${DB_HOST}|" "$WP_TESTS_DIR"/wp-tests-config.php
	fi

	# Before finished running install_test_suite - return to directory $WP_CORE_DIR where wp-cli installed
	cd "${WP_CORE_DIR}"
}

create_plugins_folder() {
	if [ ! -d "${WP_CORE_DIR}wp-content/plugins" ]; then
		mkdir "${WP_CORE_DIR}wp-content/plugins"
	fi
}

install_plugins() {
	create_plugins_folder
	# Create symlink to current path
	ln -s "${INITIAL_WORKING_DIRECTORY}" "${CURRENT_PLUGIN_DIR}"
	# Install plugins
	wp plugin activate "$WP_PLUGINS"
}

install_themes() {
	# Install the theme
	wp theme install "$WP_THEMES" --activate
}

import_template() {
	# Import elementor json template to db
	wp elementor library import "${CURRENT_PLUGIN_TEST_DIR}/imgcomp/elementor-17-2020-11-16.json" --user="$WP_USER"
#	GET_TEMPLATE_IDS=$(wp elementor library import "${CURRENT_PLUGIN_TEST_DIR}/imgcomp/elementor-17-2020-11-16.json" --user="$WP_USER")
#	print_msg "$GET_TEMPLATE_IDS"
	#	wp db check
	#	wp config list
	#grep '[[],]]\s+\K[0-9]+' <<< "$GET_TEMPLATE_IDS"
	#	wp post list --post_name=elementor-page-17 --post_type=elementor_library --fields=ID,post_title,post_status

	#	wp post-type get elementor_library --fields=id
	#	wp post-type list --capability_type=post --fields=name,public
	#	wp site --field=url
	TEMPLATE_ID=$(wp db query "SELECT id FROM wp_posts WHERE post_name='elementor-page-17';")
	wp post update "${TEMPLATE_ID}" --post_type=page --user="$WP_USER"
	wp post list
}

run_build() {
	cd "$CURRENT_PLUGIN_DIR"
	npm i grunt-cli
	grunt build
}

install_wp_server() {
	cd "$WP_CORE_DIR"
	wp db check
	wp config list
	# Launches PHP's built-in web server run on port 80 (for multisite)
#	SERVER=$(wp server &)
	SERVER=$(wp server &)
	echo "$SERVER"
	bg SERVER

#	if [ -z $1 ]; then
#		echo "Must run command with the url you want to visit."
#		exit 1
#	else
#		URL=$1
#	fi
#	[[ -x $BROWSER ]] && exec "$BROWSER" "$URL"
#	path=$(which xdg-open || which gnome-open) && exec "$path" "$URL"
#	if open -Ra "safari"; then
#		echo "VERIFIED: 'Safari' is installed, opening browser..."
#		open -a safari "$URL"
#	else
#		echo "Can't find any browser"
#	fi
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
	if [ -L "${CURRENT_PLUGIN_DIR}" ]; then
		unlink "${CURRENT_PLUGIN_DIR}"
		print_msg "The symlink ${CURRENT_PLUGIN_DIR} is deleted."
	fi
}

delete_the_installed_directories() {
	# Delete the $WP_CORE_DIR directory and all its contents, including any subdirectories and files
	if [ -d "$WP_CORE_DIR" ]; then
		rm -rf "$WP_CORE_DIR"
		if [ ! -d "$WP_CORE_DIR" ]; then
			print_msg "Directory $WP_CORE_DIR is deleted."
		else
			print_msg "Directory $WP_CORE_DIR does not delete."
		fi
	fi

	# Delete the $WP_TESTS_DIR directory and all its contents, including any subdirectories and files
	if [ -d "$WP_TESTS_DIR" ]; then
		rm -rf "$WP_TESTS_DIR"
		if [ ! -d "$WP_TESTS_DIR" ]; then
			print_msg "Directory $WP_TESTS_DIR is deleted."
		else
			print_msg "Directory $WP_TESTS_DIR does not delete."
		fi
	fi
}

wp_cli_cache_clear() {
	# Clears the internal cache
	wp cli cache clear
}
