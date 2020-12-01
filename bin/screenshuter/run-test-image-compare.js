'use strict';

/**
 * Import request params
 */
require( './config' );

/**
 * Import functions (like to write source test-functions.sh)
 */
const test = require( './test-functions' );

/**
 * The below functions running basic test
 */
test.run_build();
test.run_wp_server();
test.test_screenshots();
test.kill_server_process();
