<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Editor_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Editor_Settings extends Elementor_Test_Base {

	public function test_apply_name__stores_unregistered_legacy_widget_name_in_settings() {
		// Arrange
		$node = [
			'id' => 'addon1',
			'elType' => 'widget',
			'widgetType' => 'inactive-addon-widget',
			'settings' => [],
		];

		// Act
		Editor_Settings::apply_name( $node, 'Pricing Table' );

		// Assert
		$this->assertSame( 'Pricing Table', $node['settings']['_title'] );
		$this->assertArrayNotHasKey( 'title', $node['editor_settings'] ?? [] );
	}

	public function test_apply_name__stores_registered_atomic_widget_name_in_editor_settings() {
		// Arrange
		$node = [
			'id' => 'heading1',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
		];

		// Act
		Editor_Settings::apply_name( $node, 'Hero Title' );

		// Assert
		$this->assertSame( 'Hero Title', $node['editor_settings']['title'] );
		$this->assertArrayNotHasKey( '_title', $node['settings'] );
	}

	public function test_read__returns_atomic_widget_name_from_editor_settings() {
		// Arrange
		$node = [
			'id' => 'heading1',
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [],
			'editor_settings' => [ 'title' => 'Hero Title' ],
		];

		// Act
		$result = Editor_Settings::read( $node );

		// Assert
		$this->assertSame( [ 'name' => 'Hero Title' ], $result );
	}

	public function test_read__returns_unregistered_legacy_widget_name_from_settings() {
		// Arrange
		$node = [
			'id' => 'addon1',
			'elType' => 'widget',
			'widgetType' => 'inactive-addon-widget',
			'settings' => [ '_title' => 'Pricing Table' ],
		];

		// Act
		$result = Editor_Settings::read( $node );

		// Assert
		$this->assertSame( [ 'name' => 'Pricing Table' ], $result );
	}
}
