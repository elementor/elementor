<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Module as Checklist_Module;
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

	/**
	 *
	 * @param array<array<bool>> $test_case.
	 *
	 * @dataProvider test_cases_provider
	 *
	 * @return void
	 */
	public function test__kit_installation( $test_case ) {
		// Plugin activated
		$this->assertTrue( $test_case[0]['preferences_switch_expected'] === $this->checklist_module->is_preference_switch_on() );
		$this->assertTrue( $test_case[0]['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $test_case[0]['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #1
		$this->set_counter_adapter_mock( [ 'get_count' => 1 ] );
		$this->set_checklist_module();
		$this->assertTrue( $test_case[1]['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $test_case[1]['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #2
		$this->set_counter_adapter_mock( [ 'get_count' => 2 ] );
		$this->set_checklist_module();
		$this->assertTrue( $test_case[2]['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $test_case[2]['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #3
		$this->set_counter_adapter_mock( [ 'get_count' => 3 ] );
		$this->set_checklist_module();
		$this->assertTrue( $test_case[3]['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $test_case[3]['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );
	}

	/**
	 * Data provider.
	 *
	 * @return array<array<array<bool>>>
	 */
	public static function test_cases_provider() {
		return [
			[
				[
					'preferences_switch_expected' => true,
					'should_switch_preferences_off_expected' => false,
					'should_open_in_editor_expected' => false,
				],
				[
					'should_switch_preferences_off_expected' => false,
					'should_open_in_editor_expected' => false,
				],
				[
					'should_switch_preferences_off_expected' => false,
					'should_open_in_editor_expected' => true,
				],
				[
					'should_switch_preferences_off_expected' => false,
					'should_open_in_editor_expected' => false,
				],
			],
		];
	}
}
