<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Kit_Installation extends Step_Test_Base {
	public function setUp(): void {
		$this->set_wordpress_adapter_mock( [ 'has_custom_logo' ], [
			'has_custom_logo' => false,
		] );

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
