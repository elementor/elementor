<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Bootstrap extends Elementor_Test_Base {
	public function test_plugin_activated() {
		$this->assertTrue( is_plugin_active( PLUGIN_PATH ) );
	}

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Plugin', \Elementor\Plugin::$instance );
	}

	public function test_Clone() {
		$this->expect_doing_it_wrong('__clone');

		$obj_cloned = clone \Elementor\Plugin::$instance;
	}
}
