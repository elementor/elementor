<?php
namespace Elementor\Testing;

class Elementor_Test_Bootstrap extends Elementor_Test_Base {

	public function setUp() {
		parent::setUp();

		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

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
		$this->assertInstanceOf( '\Elementor\Plugin', \Elementor\Plugin::$instance );
	}

	/**
	 * @expectedIncorrectUsage __clone
	 */
	public function test_Clone() {
		$obj_cloned = clone \Elementor\Plugin::$instance;
	}

	/**
	 * @expectedIncorrectUsage __wakeup
	 */
	public function test_Wakeup() {
		unserialize( serialize( \Elementor\Plugin::$instance ) );
	}

	public function test_should_echo_fail_php_version_massage() {
		$this->expectOutputRegex( '/Elementor requires PHP version 5\.4.*/' );
		elementor_fail_php_version();
	}

	public function test_should_echo_fail_wp_version_massage() {
		$this->expectOutputRegex( '/Elementor requires WordPress version 4\.6.*/' );
		elementor_fail_wp_version();
	}
}
