'use strict';

/**
 * Class BaseApp represent the base functionality of app
 */
class BaseApp {
	constructor() {
		this.helpers = require( './Helpers' );
		this.installShelljs();
		this.shell = require( 'shelljs' );
		this.installChalk();
		this.args = require( './config' );
	}

	installShelljs() {
		if ( ! this.helpers.isInstalledPackage( 'shelljs' ) ) {
			this.helpers.execShellCommand( 'npm i -g shelljs' );
		}
	}

	installChalk() {
		if ( ! this.helpers.isInstalledPackage( 'chalk' ) ) {
			this.helpers.execShellCommand( 'npm i -g chalk' );
		}
	}

	installWpCli() {
		this.helpers.createFolder( this.args.wp_core_dir );

		process.chdir( this.args.wp_core_dir );

		// Download and install wp-cli
		this.helpers.execShellCommand( `curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar` );
		// Set the permissions to make it executable
		this.helpers.execShellCommand( 'chmod +x wp-cli.phar' );
		this.helpers.execShellCommand( 'sudo mv wp-cli.phar /usr/local/bin/wp' );
		// Get wp info for debug
		this.helpers.execShellCommand( 'wp --info' );
	}

	installPackagesForImagesCompare() {
		// process.chdir( this.args.wp_core_dir );
		if ( ! this.helpers.isInstalledPackage( 'minimist' ) ) {
			this.helpers.execShellCommand( 'npm i minimist' );
		}
		if ( ! this.helpers.isInstalledPackage( 'backstopjs' ) ) {
			this.helpers.execShellCommand( 'npm i -g backstopjs' );
		}
	}

	downloadWpCore() {
		// Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
		this.helpers.execShellCommand( `wp core download --locale="${ this.args.wp_locale }" --version="${ this.args.db_version }" --skip-plugins` );
	}

	config() {
		//Create the wp-config file
		this.helpers.execShellCommand( `wp config create --dbname="${ this.args.db_name }" --dbuser="${ this.args.db_user }" --dbpass="${ this.args.db_pass }"` );
	}

	install() {
		// Create database
		this.helpers.execShellCommand( 'wp db create' );

		// Parse db_host for port or socket references
		const parts = this.args.db_host.split( ':' );
		console.log( parts );
		const dbHostname = parts[ 0 ];
		const dbSockOrPort = parts[ 1 ];
		let extra = '';

		if ( dbHostname && dbHostname.length ) {
			if ( dbSockOrPort && dbSockOrPort.length ) {
				extra = `--host=${ dbHostname } --port=${ dbSockOrPort } --protocol=tcp`;
			} else if ( dbSockOrPort && dbSockOrPort.length ) {
				extra = `--socket=${ dbSockOrPort }`;
			} else if ( dbHostname && dbHostname.length ) {
				extra = `--host=${ dbHostname } --protocol=tcp`;
			}
		}

		//Optimizes the database
		this.helpers.execShellCommand( `wp db optimize --dbuser="${ this.args.db_user }" --dbpass="${ this.args.db_pass }" ${ extra }` );

		//Install WordPress
		this.helpers.execShellCommand( `wp core install --url="${ this.args.db_host }" --title="${ this.args.wp_site_name }" --admin_user="${ this.args.wp_user }" --admin_password="${ this.args.wp_user_pass }" --admin_email="${ this.args.wp_user_email }"` );
	}

	installPlugins() {
		this.helpers.createFolder( `${ this.args.wp_core_dir }wp-content/plugins` );
		// Create symlink to current path
		this.helpers.createSymlink( this.args.initial_working_directory, this.args.current_plugin_dir );
		// this.helpers.execShellCommand( `ln -s "${ this.args.initial_working_directory }" "${ this.args.current_plugin_dir }"` );
		// Install plugins
		this.helpers.execShellCommand( `wp plugin activate "${ this.args.wp_plugins }"` );
	}

	installThemes() {
		// Install the theme
		this.helpers.execShellCommand( `wp theme install "${ this.args.wp_themes }" --activate` );
	}

	importTestTemplates() {
		if ( this.args.files.length ) {
			for ( const file of this.args.files ) {
				// Import elementor json template to db
				this.helpers.execShellCommand( `wp elementor library import "${ this.args.current_plugin_test_dir }/screenshotter/config/${ file }.json" --user="${ this.args.wp_user }"` );

				// Extract the template id from given string and update the pot_type of post to 'page'
				const templateID = this.helpers.execShellCommand( `wp db query "SELECT id FROM wp_posts WHERE post_name='${ file }' ORDER BY 'id' ASC LIMIT 1;"` ).replace( /[^0-9]/g, '' );
				this.helpers.execShellCommand( `wp db query "UPDATE wp_posts SET post_type='page' WHERE id='${ templateID }';"` );

				//For debug state
				this.helpers.execShellCommand( `wp db query "SELECT id,post_title,post_name,post_type,post_status,post_date FROM wp_posts WHERE id='${ templateID }';"` );
			}
		}
	}

	runBuild() {
		process.chdir( this.args.current_plugin_dir );
		console.log( process.cwd() );
		console.log( ! this.helpers.isInstalledPackage( 'grunt-cli' ) );
		if ( ! this.helpers.isInstalledPackage( 'grunt-cli' ) ) {
			this.helpers.execShellCommand( 'npm i grunt-cli' );
		}
		this.helpers.execShellCommand( 'grunt build' );
	}

	runWpServer() {
		process.chdir( this.args.wp_core_dir );
		console.log( process.cwd() );
		// rewrite url structure
		this.helpers.execShellCommand( 'wp rewrite structure "/%postname%/"' );

		// Launches PHP's built-in web server run on port 80 (for multisite)
		this.helpers.execShellCommand( 'nohup wp server &' );
		console.log( 'nohup wp server' );
		// For debug state
		this.helpers.execShellCommand( 'wp db check' );
		this.helpers.execShellCommand( 'wp config list' );
	}

	testScreenshots() {
		console.log( 'testScreenshots' );
		// The below one command running puppeteer directly
		// this.helpers.execShellCommand(`node "${this.args.current_plugin_dir}/bin/take-screenshots.js" --url="http://localhost:8080/?p=${this.args.template_id}" --targetPath="${this.args.samples_images_dir}" --templateID="${this.args.template_id}" --device=${this.args.test_as_device}`)

		// The below two command running backstop directly  = () =>
		// this.helpers.execShellCommand( `backstop reference --config="${ this.args.current_plugin_test_dir }/screenshotter/backstop.js"` );
		this.helpers.execShellCommand( `backstop test --config="${ this.args.current_plugin_test_dir }/screenshotter/backstop.js"` );
	}

	killServerProcess() {
		this.helpers.execShellCommand( 'killall nohup wp server &' );
		const jobs = this.helpers.execShellCommand( 'jobs -l' );

		this.helpers.printMsg( 'info', jobs );
		// console.log( 'jobs' + jobs );
		// //KILL_PID=$(echo ${JOBS//[!0-9]/} | grep -o ....$) -
		// // Extract the number of pid
		// const killPid = jobs;
		// this.helpers.execShellCommand( `kill ${ killPid }` );
		// this.helpers.printMsg( `Killed process (pid) ${ killPid }` );
	}

	/************************************************************************************************
	 ************************ The Below consts Clean The Local Tests Env *************************
	 ***********************************************************************************************/

	repairsDB() {
		// Repairs the database.
		this.helpers.execShellCommand( `wp db repair` );
	}

	deleteDB() {
		// Deletes the existing database.
		this.helpers.execShellCommand( `wp db drop --yes` );
	}

	deleteSymlink() {
		const checkIsSymlink = this.isSymlink( `${ this.args.current_plugin_dir }` );
		if ( checkIsSymlink ) {
			this.helpers.unlink( `${ this.args.current_plugin_dir }` );
		}
	}

	/**
	 * Delete all installed directories and all its contents, including any subdirectories and files
	 */
	deleteTheInstalledDirectories() {
		// Delete the $wp_core_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.wp_core_dir }` );
		// Delete the $wp_tests_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.wp_tests_dir }` );
		// Delete the $samples_images_dir directory and all its contents, including any subdirectories and files
		this.helpers.deleteFolder( `${ this.args.samples_images_dir }` );
	}

	/**
	 * Clears the internal cache
	 */
	wpCliCacheClear() {
		this.helpers.execShellCommand( `wp cli cache clear` );
	}

	/**
	 * The below consts are usable only for clean local env when running tests
	 */
	cleanLocalTestsEnv() {
		/**
		 * Decided if clean local env
		 */
		if ( this.args.clean_local_env && this.args.clean_local_env.length ) {
			this.deleteDB();
			this.deleteSymlink();
			this.deleteTheInstalledDirectories();
			this.wpCliCacheClear();
		}
	}
}

module.exports = BaseApp;
