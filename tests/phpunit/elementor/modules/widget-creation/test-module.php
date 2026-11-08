<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WidgetCreation;

use Elementor\Modules\WidgetCreation\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {

	public function test_localize_settings_includes_widget_creation_config() {
		// Arrange
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );
		new Module();

		// Act
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayHasKey( 'widgetCreation', $settings );
		$this->assertArrayHasKey( 'isAngiePluginActive', $settings['widgetCreation'] );
		$this->assertArrayHasKey( 'canCreateWidget', $settings['widgetCreation'] );
		$this->assertIsBool( $settings['widgetCreation']['isAngiePluginActive'] );
		$this->assertIsBool( $settings['widgetCreation']['canCreateWidget'] );
	}

	public function test_can_create_widget_is_false_for_non_admin_even_when_exposed() {
		// Arrange
		$subscriber_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $subscriber_id );

		// Act & Assert
		$this->assertFalse( Module::can_create_widget() );
	}

	public function test_can_create_widget_requires_manage_options() {
		// Arrange
		wp_set_current_user( $this->factory()->create_and_get_administrator_user()->ID );

		// Act
		$can_create = Module::can_create_widget();

		// Assert
		if ( Module::is_angie_plugin_active() ) {
			$this->assertTrue( $can_create );
		} else {
			$this->assertFalse( $can_create );
		}
	}

	public function test_editor_v2_packages_omit_widget_creation_when_cannot_create() {
		// Arrange
		new Module();

		// Act
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert
		if ( Module::can_create_widget() ) {
			$this->assertContains( 'editor-widget-creation', $packages );
		} else {
			$this->assertNotContains( 'editor-widget-creation', $packages );
		}
	}
}
