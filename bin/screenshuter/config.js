'use strict';

/**
* For running this script in local env, you need to install:
* zip archive
* mysql
* wp-cli
*/

const argv = require( 'minimist' )( process.argv.slice( 2 ) );
console.log( argv );

const args = {
	db_name: argv.db_name ?? 'wordpress_test',
	db_user: argv.db_name ?? 'root',
	db_pass: argv.db_name ?? 'root',
	db_host: argv.db_name ?? 'localhost',
	db_version: argv.db_name ?? 'latest',

	wp_locale: 'en_US',
	wp_user: 'test',
	wp_user_pass: 'test',
	wp_user_email: 'user@example.org',
	wp_site_name: 'test',
	wp_themes: 'hello-elementor',
	wp_plugins: 'elementor',
	files: argv.files ?? [ 'page-17', 'headings', 'buttons' ],

	initial_working_directory: process.cwd(),
	wp_tests_dir: '/tmp/wordpress-tests-lib',
	wp_core_dir: '/tmp/wordpress/',
	current_plugin: 'elementor',
	current_plugin_dir: `${ this.wp_core_dir }wp-content/plugins/${ this.current_plugin }`,
	current_plugin_test_dir: `${ this.current_plugin_dir }/tests`,
	samples_images_dir: `${ this.current_plugin_dir }/tests`,

	debug: argv.debug ?? false,
	clean_local_env: argv.clean_local_env ?? false,
	test_as_device: argv.db_name ?? 'desktop',

	request_params: argv,
};

module.exports = args;

// /**
// * Explain usage: $0=<file-path> $1=<db-name> $2=<db-user> $3=<db-pass> $4=[db-host] $5=[wp-version] $6=[debug] $7=[clean-local-env] $8=[test-as-device]
// */
//
// export let db_name = argv.db_name ?? 'wordpress_test';
// export let db_user = argv.db_name ?? 'root';
// export let db_pass = argv.db_name ?? 'root';
// export let db_host = argv.db_name ?? 'localhost';
// export let db_version = argv.db_name ?? 'latest';
//
// /**
//  * Set WP params for settings
//  */
// export let wp_locale = "en_US"
// export let wp_user = "test"
// export let wp_user_pass = "test"
// export let wp_user_email = "user@example.org"
// export let wp_site_name = "test"
// export let wp_themes = "hello-elementor"
// export let wp_plugins = "elementor"
//
// /**
//  * Declare an array of files to import for testing (the name of file must be same as the post_name)
//  */
// export let files = ["page-17", "headings", "buttons"];
//
// /**
//  * Save the current working directory in an environment variable.
//  */
// export let initial_working_directory = process.cwd();
//
// console.log(initial_working_directory);
// /**
//  * Set paths to directories where to install.
//  */
// export let wp_tests_dir = '/tmp/wordpress-tests-lib';
//
// export let wp_core_dir = '/tmp/wordpress/';
// /**
//  * Set paths to current plugins and them tests directories
//  */
// export let current_plugin = "elementor";
// export let current_plugin_dir = `${wp_core_dir}wp-content/plugins/${current_plugin}`;
//
// export let current_plugin_test_dir = `${current_plugin_dir}/tests`;
//
// /**
//  * Set path to directory of sampled image to compare (before compare with percy)
//  */
// export let samples_images_dir = '/tmp/samples-images';
//
//
// /**
//  * debug (bool) - determine if running with msg like info|warning|error and etc.
//  */
// export let debug = argv.debug ?? false;
//
// /**
//  * clean_local_env (bool) (if the value equal to true - run func clean_local_tests_env )
//  */
// export let clean_local_env = argv.clean_local_env ?? false;
//
// /**
//  * test_as_device (string) - image compare run test as device (desktop|tablet|mobile|any other)
//  */
// export let test_as_device = argv.db_name ?? 'desktop';

// let args = module.exports = {};
//
// args.db_name = argv.db_name ?? 'wordpress_test';
// args.db_user = argv.db_name ?? 'root';
// args.db_pass = argv.db_name ?? 'root';
// args.db_host = argv.db_name ?? 'localhost';
// args.db_version = argv.db_name ?? 'latest';
//
// args.wp_locale = 'en_US';
// args.wp_user = 'test';
// args.wp_user_pass = 'test';
// args.wp_user_email = 'user@example.org';
// args.wp_site_name = 'test';
// args.wp_themes = 'hello-elementor';
// args.wp_plugins = 'elementor';
// args.files = ['page-17'; 'headings'; 'buttons'];
//
// args.initial_working_directory = process.cwd();
// args.wp_tests_dir = '/tmp/wordpress-tests-lib';
// args.wp_core_dir = '/tmp/wordpress/';
// args.current_plugin = 'elementor';
// args.current_plugin_dir = `${args.wp_core_dir}wp-content/plugins/${args.current_plugin}`;
// args.current_plugin_test_dir = `${args.current_plugin_dir}/tests`;
// args.samples_images_dir = `${args.current_plugin_dir}/tests`;
//
// args.debug = argv.debug ?? false;
// args.clean_local_env = argv.clean_local_env ?? false;
// args.test_as_device = argv.db_name ?? 'desktop';
//
// args.request_params = argv;
