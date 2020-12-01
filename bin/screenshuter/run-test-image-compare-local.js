'use strict';

/**
 * Import request params
 */
const args = require( './config' );

/**
 * Import functions (like to write source test-functions.sh)
 */
const test = require( './test-functions' );

/**
 * The below functions running basic test
 */
test.install_wp_cli();
// test.install_packages_for_images_compare();
// test.download_wp_core();
// test.config();
// test.install();
// test.install_plugins();
// test.install_themes();
// test.import_templates();
//
// test.run_build();
// test.run_wp_server();
// test.test_screenshots();
// test.kill_server_process();

/**
 * Decided if clean local env
 */
if ( args.clean_local_env && args.clean_local_env.length ) {
	test.clean_local_tests_env();
}
