<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Testing\Modules\AtomicWidgets\Mocks\Mock_Widget;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/mock-widget.php';

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	public function test_get_atomic_settings__returns_the_saved_value() {
		// Arrange.
		$widget = new Mock_Widget( [
			'id' => 1,
			'settings' => [
				'test_prop' => 'saved-value',
			],
		], [] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop' => 'saved-value',
		], $settings );
	}

	public function test_get_atomic_settings__returns_the_default_value() {
		// Arrange.
		$widget = new Mock_Widget( [
			'id' => 1,
			'settings' => [],
		], [] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop' => 'default-value',
		], $settings );
	}

	public function test_get_atomic_settings__returns_only_settings_that_are_defined_in_the_schema() {
		// Arrange.
		$widget = new Mock_Widget( [
			'id' => 1,
			'settings' => [
				'test_prop' => 'saved-value',
				'not_in_schema' => 'not-in-schema',
			],
		], [] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop' => 'saved-value',
		], $settings );
	}

	public function test_get_props_schema__caches_the_schema() {
		// Arrange.
		$widget = new Mock_Widget( [
			'id' => 1,
			'settings' => [],
		], [] );

		// Act.
		$schema_1 = $widget->get_props_schema();
		$schema_2 = $widget->get_props_schema();

		// Assert.
		$this->assertSame( $schema_1, $schema_2 );
	}

	public function test_get_props_schema__is_serializable() {
		// Arrange.
		$widget = new Mock_Widget( [
			'id' => 1,
			'settings' => [],
		], [] );

		// Act.
		$serialized = json_encode( $widget->get_props_schema() );

		// Assert.
		$this->assertJsonStringEqualsJsonString( '{
			"test_prop": {
				"default": "default-value"
			}
		}', $serialized );
	}
}
