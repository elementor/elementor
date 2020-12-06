'use strict';

/**
* For running this script in local env, you need to install:
* zip archive
* mysql
* wp-cli
*/

const argv = require( 'minimist' )( process.argv.slice( 2 ) );

const args = {
	db_name: argv.db_name ?? 'wordpress_test',
	db_user: argv.db_user ?? 'root',
	db_pass: argv.db_pass ?? 'root',
	db_host: argv.db_host ?? 'localhost',
	db_version: argv.db_version ?? 'latest',

	/**
	 * Set WP params for settings
	 */
	wp_locale: argv.wp_locale ?? 'en_US',
	wp_user: argv.wp_user ?? 'test',
	wp_user_pass: argv.wp_user_pass ?? 'test',
	wp_user_email: argv.wp_user_email ?? 'user@example.org',
	wp_site_name: argv.wp_site_name ?? 'test',
	wp_themes: argv.wp_themes ?? 'hello-elementor',
	wp_plugins: argv.wp_plugins ?? 'elementor',

	/**
	 * Declare an array of files to import for testing (the name of file must be same as the post_name)
	 */
	files: argv.files ?? [ 'page-17', 'headings', 'buttons' ],

	/**
	 * Save the current working directory in an environment variable.
	 */
	initial_working_directory: process.cwd(),

	/**
	 * Set paths to directories where to install.
	 */
	wp_tests_dir: '/tmp/wordpress-tests-lib',
	wp_core_dir: '/tmp/wordpress/',

	/**
	 * Set paths to current plugins and them tests directories
	 */
	current_plugin: argv.current_plugin ?? 'elementor',

	/**
	 * debug (bool) - determine if running with msg like info|warning|error and etc.
	 */
	debug: argv.debug ?? false,
	clean_local_env: argv.clean_local_env ?? false,
	/**
	 * test_as_device (string) - image compare run test as device (desktop|tablet|mobile|any other)
	 */
	test_as_device: argv.db_name ?? 'desktop',

	request_params: argv,
};

/**
 * Add more directories paths for test
 */
args.current_plugin_dir = `${ args.wp_core_dir }wp-content/plugins/${ args.current_plugin }`;
args.current_plugin_test_dir = `${ args.current_plugin_dir }/tests`;
/**
 * Set path to directory of sampled image to compare (before compare with percy)
 */
args.samples_images_dir = `${ args.current_plugin_dir }/tests`;

module.exports = args;
