<?php

class Elementor_Test_Base extends WP_UnitTestCase {

	function setUp() {
		parent::setUp();

		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );

		// Fake behavior
		if ( ! defined( 'WP_ADMIN' ) ) {
			define( 'WP_ADMIN', true );
		}

		// Make sure the main class is running
		\Elementor\Plugin::instance();

		// Run fake actions
		do_action( 'init' );
		do_action( 'plugins_loaded' );
	}

	public function test_plugin_activated() {
		$this->assertTrue( is_plugin_active( PLUGIN_PATH ) );
	}

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Plugin', \Elementor\Plugin::instance() );
	}

	public function test_getVersion() {
		$this->assertEquals( ELEMENTOR_VERSION, \Elementor\Plugin::instance()->get_version() );
	}

	/**
	 * @expectedIncorrectUsage __clone
	 */
	public function test_Clone() {
		$obj_cloned = clone \Elementor\Plugin::instance();
	}

	/**
	 * @expectedIncorrectUsage __wakeup
	 */
	public function test_Wakeup() {
		unserialize( serialize( \Elementor\Plugin::instance() ) );
	}
}
