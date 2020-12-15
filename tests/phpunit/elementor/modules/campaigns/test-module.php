<?php
namespace Elementor\Testing\Modules\Campaigns;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\Campaigns\Module;

class Elementor_Test_Campaigns_Module extends Elementor_Test_Base {

	public function test___construct() {
		// Assert that the taxonomy has been created.
		$this->assertTrue( taxonomy_exists( Module::TAXONOMY_NAME ) );
	}

	public function test_get_name() {
		$expected_module_name = 'campaigns';
		$actual_module_name = Plugin::$instance->modules_manager->get_modules( 'campaigns' )->get_name();

		$this->assertEquals( $expected_module_name, $actual_module_name );
	}
}
