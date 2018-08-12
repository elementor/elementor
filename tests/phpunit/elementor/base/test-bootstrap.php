<?php
namespace Elementor\Testing;

class Elementor_Test_Bootstrap extends Elementor_Test_Base {

	public static function setUpBeforeClass() {
		parent::setUpBeforeClass();
		remove_action( 'admin_init', '_maybe_update_themes' );
		remove_action( 'admin_init', '_maybe_update_core' );
		remove_action( 'admin_init', '_maybe_update_plugins' );

		wp_set_current_user( self::factory()->get_administrator_user()->ID );

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
}
