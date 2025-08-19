<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Kit_Installation extends Step_Test_Base {
	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__default_kit_installed() {
		parent::setUp();

		$this->set_wordpress_adapter_mock( [], [
			'set_user_preferences' => [ $this, 'set_user_preferences' ],
			'get_user_preferences' => [ $this, 'get_user_preferences' ],
		] );

		$this->mock_editor_visit();

		$this->assertTrue( $this->checklist_module->is_preference_switch_on() );
	}

	public function test__custom_kit_installed() {
		parent::setup();

		$this->set_elementor_adapter_mock( [ 'is_active_kit_default' => false, 'get_count' => 0 ] )
			->set_wordpress_adapter_mock( [], [
				'set_user_preferences' => [ $this, 'set_user_preferences' ],
				'get_user_preferences' => [ $this, 'get_user_preferences' ],
				] );

		$this->mock_editor_visit();

		$this->assertFalse( $this->checklist_module->is_preference_switch_on() );
	}

	public function test__custom_kit_installed_after_first_visit() {
		parent::setup();

		$this->set_elementor_adapter_mock( [ 'is_active_kit_default' => false, 'get_count' => 1 ] )
			->set_wordpress_adapter_mock( [], [
				'set_user_preferences' => [ $this, 'set_user_preferences' ],
				'get_user_preferences' => [ $this, 'get_user_preferences' ],
				] );

		$this->mock_editor_visit();

		$this->assertTrue( $this->checklist_module->is_preference_switch_on() );
	}
}
