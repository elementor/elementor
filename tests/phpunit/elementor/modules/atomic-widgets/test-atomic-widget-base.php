<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Testing\Modules\AtomicWidgets\Mocks\Mock_Widget_A;
use Elementor\Testing\Modules\AtomicWidgets\Mocks\Mock_Widget_B;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/mock-widget-a.php';
require_once __DIR__ . '/mocks/mock-widget-b.php';

class Test_Atomic_Widget_Base extends Elementor_Test_Base {

	public function test_get_atomic_settings__returns_the_saved_value() {
		// Arrange.
		$widget = new Mock_Widget_A( [
			'id' => 1,
			'settings' => [
				'test_prop_a' => 'saved-value',
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop_a' => 'saved-value',
		], $settings );
	}

	public function test_get_atomic_settings__returns_the_default_value() {
		// Arrange.
		$widget = new Mock_Widget_A( [
			'id' => 1,
			'settings' => [],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop_a' => 'default-value-a',
		], $settings );
	}

	public function test_get_atomic_settings__returns_only_settings_that_are_defined_in_the_schema() {
		// Arrange.
		$widget = new Mock_Widget_A( [
			'id' => 1,
			'settings' => [
				'test_prop_a' => 'saved-value',
				'not_in_schema' => 'not-in-schema',
			],
		] );

		// Act.
		$settings = $widget->get_atomic_settings();

		// Assert.
		$this->assertEquals( [
			'test_prop_a' => 'saved-value',
		], $settings );
	}

	public function test_get_props_schema__is_serializable() {
		// Act.
		$serialized = json_encode( Mock_Widget_A::get_props_schema() );

		// Assert.
		$this->assertJsonStringEqualsJsonString( '{
			"test_prop_a": {
				"default": "default-value-a"
			}
		}', $serialized );
	}
}
