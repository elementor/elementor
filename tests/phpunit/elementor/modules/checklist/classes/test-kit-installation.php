<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Kit_Installation extends Step_Test_Base {
	public function setUp(): void {
		$container = Plugin::$instance->elementor_container();
		$container->set( Wordpress_Adapter::class, $this->wordpress_adapter );
		$this->set_kit_adapter_mock( [ 'is_active_kit_default' => true ] )
			->set_counter_adapter_mock( [ 'get_count' => 0 ] );

		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__kit_installation() {
		// Plugin activated
		var_dump( $this->checklist_module->get_user_progress_from_db() );
		$this->assertTrue( $this->checklist_module->is_preference_switch_on() );
	}
}
