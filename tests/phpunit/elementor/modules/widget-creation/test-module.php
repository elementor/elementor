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
		new Module();

		// Act
		$settings = apply_filters( 'elementor/editor/localize_settings', [] );

		// Assert
		$this->assertArrayHasKey( 'widgetCreation', $settings );
		$this->assertArrayHasKey( 'isAngiePluginActive', $settings['widgetCreation'] );
		$this->assertIsBool( $settings['widgetCreation']['isAngiePluginActive'] );
	}

	public function test_editor_v2_scripts_env_includes_widget_creation_package_config() {
		// Arrange
		new Module();

		// Act
		$env = apply_filters( 'elementor/editor/v2/scripts/env', [] );

		// Assert
		$this->assertArrayHasKey( '@elementor/editor-widget-creation', $env );
		$this->assertArrayHasKey( 'is_angie_plugin_active', $env['@elementor/editor-widget-creation'] );
		$this->assertIsBool( $env['@elementor/editor-widget-creation']['is_angie_plugin_active'] );
	}

	public function test_editor_v2_packages_omit_widget_creation_when_angie_inactive() {
		// Arrange
		new Module();

		// Act
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );

		// Assert
		if ( Module::is_angie_plugin_active() ) {
			$this->assertContains( 'editor-widget-creation', $packages );
		} else {
			$this->assertNotContains( 'editor-widget-creation', $packages );
		}
	}
}
