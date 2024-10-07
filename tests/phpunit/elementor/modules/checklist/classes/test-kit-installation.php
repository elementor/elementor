<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Checklist\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Module as Checklist_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Kit_Installation extends Step_Test_Base {
	const PREFERENCE_SWITCH_EXPECTED = 'preference_switch_expected';
	const SHOULD_SWITCH_PREFERENCE_OFF = 'preference_switch_off';
	const SHOULD_AUTO_OPEN_POPUP = 'popup_auto_open';

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
	 * @dataProvider data_provider
	 */
	public function test__kit_installation( $args ) {
		$plugin_activated = $args[ self::PLUGIN_ACTIVATED ];
		$kit_first = $args[ self::KIT_FIRST_CHANGE ] ?? [];
		$preference_switch_first = $args[ self::PREFERENCE_FIRST_CHANGE ] ?? null;
		$toggle_popup_first = $args[ self::TOGGLE_POPUP_FIRST ] ?? null;
		$editor_first = $args[ self::EDITOR_FIRST_VISIT ];
		$kit_second = $args[ self::KIT_SECOND_CHANGE ] ?? [];
		$preference_switch_second = $args[ self::PREFERENCE_SECOND_CHANGE ] ?? null;
		$toggle_popup_second = $args[ self::TOGGLE_POPUP_SECOND ] ?? null;
		$editor_second = $args[ self::EDITOR_SECOND_VISIT ];
		$editor_third = $args[ self::EDITOR_THIRD_VISIT];

		// Plugin activated
		$this->assertTrue( $plugin_activated[ self::PREFERENCE_SWITCH_EXPECTED ] === $this->checklist_module->is_preference_switch_on() );
		$this->assertTrue( $plugin_activated[ self::SHOULD_SWITCH_PREFERENCE_OFF ] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $plugin_activated[ self::SHOULD_AUTO_OPEN_POPUP ] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );

		// Kit change 1
		foreach ( $kit_first as $kit_key ) {
			$this->set_kit( $kit_key );
		}

		// User Preference change 1
		if ( null !== $preference_switch_first ) {
			$this->set_user_preference_switch( $preference_switch_first );
		}

		// Editor visit #1
		$this->editor_visit( $editor_first, 1 );

		// Popup toggle #1
		if ( null !== $toggle_popup_first ) {
			$this->set_user_preference_switch( $toggle_popup_first );
		}

		if ( $toggle_popup_first ) {
			$this->set_user_preference_switch( false );
		}

		// Kit change 2
		if ( null !== $kit_second ) {
			$this->set_kit_adapter_mock( [ 'is_active_kit_default' => $kit_second === 'default' ], true );
		}

		// User Preference change 2
		if ( null !== $preference_switch_second ) {
			$this->set_user_preference_switch( $preference_switch_second );
		}

		//Editor visit #2
		$this->editor_visit( $editor_second, 2 );

		// Popup toggle #2
		if ( null !== $toggle_popup_second ) {
			$this->set_user_preference_switch( $toggle_popup_second );
		}

		if ( $toggle_popup_second ) {
			$this->set_user_preference_switch( false );
		}

		//Editor visit #3
		$this->editor_visit( $editor_third, 3 );
	}

	public function data_provider() {
		$case_1 = [
			[
				self::PLUGIN_ACTIVATED => [
					self::PREFERENCE_SWITCH_EXPECTED => true,
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_FIRST_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_SECOND_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => true,
				],
				self::EDITOR_THIRD_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
			],
		];

		$case_2 = [
			[
				self::PLUGIN_ACTIVATED => [
					self::PREFERENCE_SWITCH_EXPECTED => true,
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::KIT_FIRST_CHANGE => [ self::CUSTOM_KIT ],
				self::EDITOR_FIRST_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => true,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_SECOND_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_THIRD_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
			],
		];

		$case_3 = [
			[
				self::PLUGIN_ACTIVATED => [
					self::PREFERENCE_SWITCH_EXPECTED => true,
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::KIT_FIRST_CHANGE => [ self::CUSTOM_KIT ],
				self::EDITOR_FIRST_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => true,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::PREFERENCE_SECOND_CHANGE => true,
				self::EDITOR_SECOND_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => true,
				],
				self::EDITOR_THIRD_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
			],
		];

		$case_4 = [
			[
				self::PLUGIN_ACTIVATED => [
					self::PREFERENCE_SWITCH_EXPECTED => true,
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::KIT_FIRST_CHANGE => [ self::CUSTOM_KIT ],
				self::EDITOR_FIRST_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => true,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::TOGGLE_POPUP_FIRST => true,
				self::EDITOR_SECOND_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_THIRD_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
			],
		];

		$case_5 = [
			[
				self::PLUGIN_ACTIVATED => [
					self::PREFERENCE_SWITCH_EXPECTED => true,
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::KIT_FIRST_CHANGE => [ self::CUSTOM_KIT, self::DEFAULT_KIT ],
				self::EDITOR_FIRST_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
				self::EDITOR_SECOND_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => true,
				],
				self::EDITOR_THIRD_VISIT => [
					self::SHOULD_SWITCH_PREFERENCE_OFF => false,
					self::SHOULD_AUTO_OPEN_POPUP => false,
				],
			],
		];

		return [
			$case_1,
			$case_2,
			$case_3,
			$case_4,
			$case_5,
		];
	}

	private function editor_visit( $visit, $visit_index ) {
		$this->set_counter_adapter_mock( [ 'get_count' => $visit_index ], true );
		$this->set_checklist_module();
		$this->assertTrue( $visit[ self::SHOULD_SWITCH_PREFERENCE_OFF ] === $this->checklist_module->should_switch_preferences_off() );
		$this->assertTrue( $visit[ self::SHOULD_AUTO_OPEN_POPUP ] === $this->checklist_module->get_user_progress_from_db()[ Checklist_Module::SHOULD_OPEN_IN_EDITOR ] );
	}
}
