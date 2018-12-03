<?php
$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

define( 'ELEMENTOR_TESTS', true );

/**
 * change PLUGIN_FILE env in phpunit.xml
 */
define( 'PLUGIN_FILE', getenv( 'PLUGIN_FILE' ) );
define( 'PLUGIN_FOLDER', basename( dirname( __DIR__ ) ) );
define( 'PLUGIN_PATH', PLUGIN_FOLDER . '/' . PLUGIN_FILE );

// Activates this plugin in WordPress so it can be tested.
$GLOBALS['wp_tests_options'] = [
	'active_plugins' => [ PLUGIN_PATH ],
	'template' => 'twentysixteen',
	'stylesheet' => 'twentysixteen',
];

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter( 'muplugins_loaded', function () {
	// Manually load plugin
	require dirname( __DIR__ ) . '/' . PLUGIN_FILE;
} );

// Removes all sql tables on shutdown
// Do this action last
tests_add_filter( 'shutdown', 'drop_tables', 999999 );

require $_tests_dir . '/includes/bootstrap.php';
require __DIR__ . '/phpunit/local-factory.php';
require __DIR__ . '/phpunit/trait-test-base.php';
require __DIR__ . '/phpunit/base-class.php';
require __DIR__ . '/phpunit/ajax-class.php';
require __DIR__ . '/phpunit/manager.php';
\Elementor\Testing\Manager::instance();

if ( getenv( 'PART_RUN' ) ) {
	\Elementor\Plugin::instance();

	// Run fake actions
	do_action( 'init' );
	do_action( 'plugins_loaded' );

	\Elementor\Plugin::$instance->init_common();
}
