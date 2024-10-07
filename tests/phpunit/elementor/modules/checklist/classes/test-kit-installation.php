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
	 * @dataProvider test_cases_provider
	 */
	public function test__kit_installation( $plugin_activated, $editor_first, $editor_second, $editor_third ) {
		// Plugin activated
		$this->assertTrue( $plugin_activated['preferences_switch_expected'] === $this->checklist_module->is_preference_switch_on() );
		$this->assertTrue( $plugin_activated['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $plugin_activated['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #1
		$this->set_counter_adapter_mock( [ 'get_count' => 1 ] );
		$this->set_checklist_module();
		$this->assertTrue( $editor_first['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $editor_first['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #2
		$this->set_counter_adapter_mock( [ 'get_count' => 2 ] );
		$this->set_checklist_module();
		$this->assertTrue( $editor_second['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $editor_second['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		//Editor visit #3
		$this->set_counter_adapter_mock( [ 'get_count' => 3 ] );
		$this->set_checklist_module();
		$this->assertTrue( $editor_second['should_switch_preferences_off_expected'] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $editor_second['should_open_in_editor_expected'] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );
	}

	public function test_cases_provider() {
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
