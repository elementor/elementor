'use strict';

/**
 * Import request params
 */
// import args from './request-params';

const args = require( './config' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );

console.log( args.request_params.db_name );
console.log( args.db_name );
console.log( args.wp_core_dir );
console.log( process.cwd() );

function printMsg( msg ) {
	// If debug equal to true - display msg
	if ( args.debug ) {
		const now = new Date();
		console.log( `\n${ now } - ${ msg }` );
	}
}

function execute( cmd ) {
	exec( cmd, ( error, stdout, stderr ) => {
		if ( error ) {
			printMsg( `error: ${ error.message }` );
			return;
		}
		if ( stderr ) {
			printMsg( `stderr: ${ stderr }` );
			return;
		}
		printMsg( `success ${ stdout }'` );
		return stdout;
	} );
}

function download( cmd ) {
	execute( `${ cmd }` );
}

function installPackagesForImagesCompare() {
	process.chdir( args.wp_core_dir );
	execute( `npm i minimist` ); //baseApp
	execute( `npm i -g backstopjs` );
}

// install_packages_for_images_compare();

function installWpCli() {
	// ! fs.existsSync( `${ args.wp_core_dir }` ) && fs.mkdirSync( `${ args.wp_core_dir }`, { recursive: true } );
	if ( ! fs.existsSync( args.wp_core_dir ) ) {
		fs.mkdirSync( `${ args.wp_core_dir }`, { recursive: true } );
	}

	process.chdir( args.wp_core_dir );

	// Download and install wp-cli
	execute( `curl -O ${ path }` );
	// Set the permissions to make it executable
	execute( 'chmod +x wp-cli.phar' );
	execute( 'sudo mv wp-cli.phar /usr/local/bin/wp' );
	// Get wp info for debug
	execute( 'wp --info' );
}

function downloadWpCore() {
	// Download the WordPress core files [--skip-plugins - Download WP without the default plugins.]
	execute( `wp core download --locale="${ args.wp_locale }" --version="${ args.db_version }" --skip-plugins` );
}
function config() {
	//Create the wp-config file
	execute( `wp config create --dbname="${ args.db_name }" --dbuser="${ args.db_user }" --dbpass="${ args.db_pass }"` );
}
function install() {
	//Create database
	execute( 'wp db create' );

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
	execute( `wp db optimize --dbuser="${ args.db_user }" --dbpass="${ args.db_pass }"` );
	//Install WordPress
	execute( `wp core install --url="${ args.db_host }" --title="${ args.wp_site_name }" --admin_user="${ args.wp_user }" --admin_password="${ args.wp_user_pass }" --admin_email="${ args.wp_user_email }"` );
}

function createFolderIfNotExists( path, recursive = true ) {
	if ( ! fs.existsSync( `${ path }` ) ) {
		fs.mkdirSync( `${ path }`, { recursive: recursive } );
	}
}

function installPlugins() {
	createFolderIfNotExists( `${ args.wp_core_dir }wp-content/plugins` );
	// Create symlink to current path
	execute( `ln -s "${ args.initial_working_directory }" "${ args.current_plugin_dir }"` );
	// Install plugins
	execute( `wp plugin activate "${ args.wp_plugins }"` );
}

function installThemes() {
	// Install the theme
	execute( `wp theme install "${ args.wp_themes }" --activate` );
}

function importTemplates() {
	process.chdir( args.wp_core_dir );
	for ( file in args.files ) {
		// Import elementor json template to db
		execute( `wp elementor library import "${ args.current_plugin_test_dir }/screenshotter/config/${ file }.json" --user="${ args.wp_user }"` );
		const templateID = execute( `wp db query "SELECT id FROM wp_posts WHERE post_name='${ file }' ORDER BY 'id' ASC LIMIT 1;"` );

		console.log( templateID );
		// Extract template id
		console.log( templateID );

		execute( `wp db query "UPDATE wp_posts SET post_type='page' WHERE id='${ templateID }';"` );

		//For debug state
		execute( `wp db query "SELECT id,post_title,post_name,post_type,post_status,post_date FROM wp_posts WHERE id='${ templateID }';"` );
	}
}

function runBuild() {
	process.chdir( args.current_plugin_dir );
	execute( 'npm i grunt-cli' );
	execute( 'grunt build' );
}

function runWpServer() {
	process.chdir( args.wp_core_dir );

	// rewrite url structure
	execute( 'wp rewrite structure "/%postname%/"' );

	// Launches PHP's built-in web server run on port 80 (for multisite)
	execute( 'nohup wp server &' );

	// For debug state
	execute( 'wp db check' );
	execute( 'wp config list' );
}

function testScreenshots() {
	// The below one command running puppeteer directly
	// execute(`node "${args.current_plugin_dir}/bin/take-screenshots.js" --url="http://localhost:8080/?p=${args.template_id}" --targetPath="${args.samples_images_dir}" --templateID="${args.template_id}" --device=${args.test_as_device}`)

	// The below two command running backstop directly ()
	// execute( `backstop reference --config="${ args.current_plugin_test_dir }/screenshotter/backstop.js"` );
	execute( `backstop test --config="${ args.current_plugin_test_dir }/screenshotter/backstop.js"` );
}

function killServerProcess() {
	execute( 'killall nohup wp server &' );
	const jobs = execute( 'jobs -l' );
	printMsg( jobs );
	//KILL_PID=$(echo ${JOBS//[!0-9]/} | grep -o ....$) -
	// Extract the number of pid
	const killPid = jobs;
	execute( `kill ${ killPid }` );
	printMsg( `Killed process (pid) ${ killPid }` );
	printMsg( 'Killed process (pid) $KILL_PID' );
}

/************************************************************************************************
 ************************ The Below Functions Clean The Local Tests Env *************************
 ***********************************************************************************************/

function repairsDB() {
	// Repairs the database.
	execute( `wp db repair` );
}
function deleteDB() {
	// Deletes the existing database.
	execute( `wp db drop --yes` );
}

/**
 * Create a symbolic link
 * @target (string) - The target path to folder/file
 * @path (string) - The path to folder/file
 */
function createSymlink( target, path ) {
	try {
		fs.symlinkSync( target, path, 'dir' );
		printMsg( 'Symbolic link creation complete.' );
	} catch ( error ) {
		printMsg( error );
	}
}

/**
 * Deleting symbolic link
 * @path (string) - The path to folder/file
 */
function unlink( path ) {
	fs.unlink( path, ( ( err ) => {
		if ( err ) {
			printMsg( err );
		} else {
			printMsg( `Deleted Symbolic Link: ${ path }.` );
		}
	} ) );
}

/**
 * Check if folder/file is a symbolic link
 * @path (string) - The path to folder/file
 */
function isSymlink( path ) {
	try {
		return fs.lstatSync( path ).isSymbolicLink();
	} catch ( err ) {}
	return null;
}

function deleteSymlink() {
	const checkIsSymlink = isSymlink( `${ args.current_plugin_dir }` );
	if ( checkIsSymlink ) {
		unlink( `${ args.current_plugin_dir }` );
	}
}

/**
 * Delete directory and all its contents, including any subdirectories and files
 * @path (string) - The path to folder
 */
function deleteFolderRecursive( path ) {
	if ( fs.existsSync( path ) ) {
		fs.readdirSync( path ).forEach( function( file, index ) {
			const curPath = path + '/' + file;
			if ( fs.lstatSync( curPath ).isDirectory() ) { // recurse
				deleteFolderRecursive( curPath );
			} else { // delete file
				fs.unlinkSync( curPath );
			}
		} );
		fs.rmdirSync( path );
	}
}

/**
 * Delete exists directory and all its contents, including any subdirectories and files
 */
function deleteExistsFolder( path ) {
	if ( fs.existsSync( `${ path }` ) ) {
		deleteFolderRecursive( `${ path }` );
		if ( ! fs.existsSync( `${ path }` ) ) {
			printMsg( `Deleted directory: ${ path }.` );
		} else {
			printMsg( `Can't deleted directory: ${ path }.` );
		}
	}
}

/**
 * Delete all installed directories and all its contents, including any subdirectories and files
 */
function deleteTheInstalledDirectories() {
	// Delete the $wp_core_dir directory and all its contents, including any subdirectories and files
	deleteExistsFolder( `${ args.wp_core_dir }` );
	// Delete the $wp_tests_dir directory and all its contents, including any subdirectories and files
	deleteExistsFolder( `${ args.wp_tests_dir }` );
	// Delete the $samples_images_dir directory and all its contents, including any subdirectories and files
	deleteExistsFolder( `${ args.samples_images_dir }` );
}

/**
 * Clears the internal cache
 */
function wpCliCacheClear() {
	execute( `wp cli cache clear` );
}

/**
 * The below functions are usable only for clean local env when running tests
 */
function cleanLocalTestsEnv() {
	deleteDB();
	deleteSymlink();
	deleteTheInstalledDirectories();
	wpCliCacheClear();
}
