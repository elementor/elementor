<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Modules\Checklist\Module as Checklist_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Kit_Installation extends Step_Test_Base {
	const PREFERENCE_SWITCH_EXPECTED = 'preference_switch_expected';
	const SHOULD_SWITCH_PREFERENCE_OFF = 'preference_switch_off';
	const SHOULD_AUTO_OPEN_POPUP = 'popup_auto_open';

	public function setUp(): void {
		$this->set_kit_adapter_mock( [ 'is_active_kit_default' => true ] )
			->set_counter_adapter_mock( [ 'get_count' => 0 ] );

		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test_editor_count() {}

	public function test__kit_installation( $args ) {
		$this->setUp();
	}


}
