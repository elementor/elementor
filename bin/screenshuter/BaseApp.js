'use strict';

/**
 * Import request params
 */
// import args from './request-params';

// const args = require( './config' );
// const { exec } = require( 'child_process' );
// const fs = require( 'fs' );

// console.log( this.args.request_params.db_name );
// console.log( this.args.db_name );
// console.log( this.args.wp_core_dir );
// console.log( process.cwd() );

class BaseApp {
	constructor() {
		this.helpers = require( './Helpers' );
		this.args = require( './config' );
	}

	installPackagesForImagesCompare = () => {
		process.chdir( this.args.wp_core_dir );
		this.helpers.execute( `npm i minimist` ); //baseApp
		this.helpers.execute( `npm i -g backstopjs` );
	};

	// install_packages_for_images_compare = () => {};

	installWpCli = () => {
		this.helpers.createFolder( this.args.wp_core_dir );

		process.chdir( this.args.wp_core_dir );

		// Download and install wp-cli
		this.helpers.execute( `curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar` );
		// Set the permissions to make it executable
		this.helpers.execute( 'chmod +x wp-cli.phar' );
		this.helpers.execute( 'sudo mv wp-cli.phar /usr/local/bin/wp' );
		// Get wp info for debug
		this.helpers.execute( 'wp --info' );
	};

	downloadWpCore = () => {
		// Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
		this.helpers.execute( `wp core download --locale="${ this.args.wp_locale }" --version="${ this.args.db_version }" --skip-plugins` );
	};

	config = () => {
		//Create the wp-config file
		this.helpers.execute( `wp config create --dbname="${ this.args.db_name }" --dbuser="${ this.args.db_user }" --dbpass="${ this.args.db_pass }"` );
	};

	install = () => {
		//Create database
		this.helpers.execute( 'wp db create' );

		// Parse db_host for port or socket references
		// local PARTS=(${db_host//\:/ })
		// local DB_HOSTNAME=${PARTS[0]}
		// local DB_SOCK_OR_PORT=${PARTS[1]}
		// local EXTRA=""
		//
		// if ! [ -z "$DB_HOSTNAME" ]; then
		// 	if [ $(echo "$DB_SOCK_OR_PORT" | grep -e '^[0-9]\{1,\}$') ]; then
		// 		EXTRA="--host=$DB_HOSTNAME --port=$DB_SOCK_OR_PORT --protocol=tcp"
		// 	elif ! [ -z $DB_SOCK_OR_PORT ]; then
		// 		EXTRA="--socket=$DB_SOCK_OR_PORT"
		// 	elif ! [ -z $DB_HOSTNAME ]; then
		// 		EXTRA="--host=$DB_HOSTNAME --protocol=tcp"
		// 	fi
		// fi

		//Optimizes the database
		this.helpers.execute( `wp db optimize --dbuser="${ this.args.db_user }" --dbpass="${ this.args.db_pass }"` );
		//Install WordPress
		this.helpers.execute( `wp core install --url="${ this.args.db_host }" --title="${ this.args.wp_site_name }" --admin_user="${ this.args.wp_user }" --admin_password="${ this.args.wp_user_pass }" --admin_email="${ this.args.wp_user_email }"` );
	};

	installPlugins = () => {
		this.helpers.createFolder( `${ this.args.wp_core_dir }wp-content/plugins` );
		// Create symlink to current path
		this.helpers.execute( `ln -s "${ this.args.initial_working_directory }" "${ this.args.current_plugin_dir }"` );
		// Install plugins
		this.helpers.execute( `wp plugin activate "${ this.args.wp_plugins }"` );
	};

	installThemes = () => {
		// Install the theme
		this.helpers.execute( `wp theme install "${ this.args.wp_themes }" --activate` );
	};

	importTemplates = () => {
		process.chdir( this.args.wp_core_dir );
		for ( const file in this.args.files ) {
			// Import elementor json template to db
			this.helpers.execute( `wp elementor library import "${ this.args.current_plugin_test_dir }/screenshotter/config/${ file }.json" --user="${ this.args.wp_user }"` );
			const templateID = this.helpers.execute( `wp db query "SELECT id FROM wp_posts WHERE post_name='${ file }' ORDER BY 'id' ASC LIMIT 1;"` );

			console.log( templateID );
			// Extract template id
			console.log( templateID );

			this.helpers.execute( `wp db query "UPDATE wp_posts SET post_type='page' WHERE id='${ templateID }';"` );

			//For debug state
			this.helpers.execute( `wp db query "SELECT id,post_title,post_name,post_type,post_status,post_date FROM wp_posts WHERE id='${ templateID }';"` );
		}
	};

	runBuild = () => {
		process.chdir( this.args.current_plugin_dir );
		this.helpers.execute( 'npm i grunt-cli' );
		this.helpers.execute( 'grunt build' );
	};

	runWpServer = () => {
		process.chdir( this.args.wp_core_dir );

		// rewrite url structure
		this.helpers.execute( 'wp rewrite structure "/%postname%/"' );

		// Launches PHP's built-in web server run on port 80 (for multisite)
		this.helpers.execute( 'nohup wp server &' );

		// For debug state
		this.helpers.execute( 'wp db check' );
		this.helpers.execute( 'wp config list' );
	};

	testScreenshots = () => {
		// The below one command running puppeteer directly
		// this.helpers.execute(`node "${this.args.current_plugin_dir}/bin/take-screenshots.js" --url="http://localhost:8080/?p=${this.args.template_id}" --targetPath="${this.args.samples_images_dir}" --templateID="${this.args.template_id}" --device=${this.args.test_as_device}`)

		// The below two command running backstop directly  = () =>
		// this.helpers.execute( `backstop reference --config="${ this.args.current_plugin_test_dir }/screenshotter/backstop.js"` );
		this.helpers.execute( `backstop test --config="${ this.args.current_plugin_test_dir }/screenshotter/backstop.js"` );
	};

	killServerProcess = () => {
		this.helpers.execute( 'killall nohup wp server &' );
		const jobs = this.helpers.execute( 'jobs -l' );
		this.helpers.printMsg( jobs );
		//KILL_PID=$(echo ${JOBS//[!0-9]/} | grep -o ....$) -
		// Extract the number of pid
		const killPid = jobs;
		this.helpers.execute( `kill ${ killPid }` );
		this.helpers.printMsg( `Killed process (pid) ${ killPid }` );
		this.helpers.printMsg( 'Killed process (pid) $KILL_PID' );
	};

	/************************************************************************************************
	 ************************ The Below consts Clean The Local Tests Env *************************
	 ***********************************************************************************************/

	repairsDB = () => {
		// Repairs the database.
		this.helpers.execute( `wp db repair` );
	};

	deleteDB = () => {
		// Deletes the existing database.
		this.helpers.execute( `wp db drop --yes` );
	};

	deleteSymlink = () => {
		const checkIsSymlink = isSymlink( `${ this.args.current_plugin_dir }` );
		if ( checkIsSymlink ) {
			this.helpers.unlink( `${ this.args.current_plugin_dir }` );
		}
	};

	/**
	 * Delete all installed directories and all its contents, including any subdirectories and files
	 */
	deleteTheInstalledDirectories = () => {
		// Delete the $wp_core_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.wp_core_dir }` );
		// Delete the $wp_tests_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.wp_tests_dir }` );
		// Delete the $samples_images_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.samples_images_dir }` );
	};

	/**
	 * Clears the internal cache
	 */
	wpCliCacheClear = () => {
		this.helpers.execute( `wp cli cache clear` );
	};

	/**
	 * The below consts are usable only for clean local env when running tests
	 */
	cleanLocalTestsEnv = () => {
		/**
		 * Decided if clean local env
		 */
		if ( this.args.clean_local_env && this.args.clean_local_env.length ) {
			this.deleteDB();
			this.deleteSymlink();
			this.deleteTheInstalledDirectories();
			this.wpCliCacheClear();
		}
	};
}

module.exports = new BaseApp;
