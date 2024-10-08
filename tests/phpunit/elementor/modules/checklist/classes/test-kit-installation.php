<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Modules\Checklist\Module as Checklist_Module;

class Test_Kit_Installation extends Step_Test_Base {
	const PREFERENCE_SWITCH_EXPECTED = 'preference_switch_expected';
	const SHOULD_SWITCH_PREFERENCE_OFF = 'preference_switch_off';
	const SHOULD_AUTO_OPEN_POPUP = 'popup_auto_open';

	private $user_preferences_mock = [];

	public function setUp(): void {
		$this->set_kit_adapter_mock( [ 'is_active_kit_default' => true ] )
			->set_counter_adapter_mock( [ 'get_count' => 0 ] );

		parent::setUp();

		$this->set_user_preferences( Checklist_Module::VISIBILITY_SWITCH_ID, $this->is_preference_switch_on() ? 'yes' : '' );
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test__default_kit_installed() {
		parent::setUp();

		$this->set_kit_adapter_mock( [ 'is_active_kit_default' => true ] )
			->set_counter_adapter_mock( [ 'get_count' => 0 ] )
			->set_wordpress_adapter_mock( [], [
			'set_user_preferences' => [ $this, 'set_user_preferences' ],
			'get_user_preferences' => [ $this, 'get_user_preferences' ],
		], true );

		$this->mock_editor_visit();

		var_dump( $this->user_preferences_mock );
		$this->assertTrue( $this->checklist_module->is_preference_switch_on() );
	}

	public function test__custom_kit_installed() {
		parent::setup();

		$this->set_kit_adapter_mock( [ 'is_active_kit_default' => false ] )
			->set_counter_adapter_mock( [ 'get_count' => 0 ] )
			->set_wordpress_adapter_mock( [], [
				'set_user_preferences' => [ $this, 'set_user_preferences' ],
				'get_user_preferences' => [ $this, 'get_user_preferences' ],
				], true );

		$this->mock_editor_visit();

		var_dump( $this->user_preferences_mock );
		$this->assertFalse( $this->checklist_module->is_preference_switch_on() );
	}

	public function set_user_preferences( $key, $value ) {
		$this->user_preferences_mock[ $key ] = $value;
	}

	public function get_user_preferences( $key ) {
		return $this->user_preferences_mock[ $key ] ?? null;
	}
}
