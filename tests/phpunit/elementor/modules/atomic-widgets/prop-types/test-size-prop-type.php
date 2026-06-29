<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Prop_Type extends TestCase {

	public function test_sanitize() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Act.
		$input = [
			'$$type' => 'size',
			'value' => [
				'size' => 10.55,
				'unit' => 'px',
			],
		];
		$result = $prop_type->sanitize( $input );

		// Assert.
		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 10.55,
				'unit' => 'px',
			],
		];
		$this->assertSame( $expected, $result );
	}

	public function test_units_method_sets_available_units_in_settings() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();
		$custom_units = [ 'px', 'em', 'rem' ];

		// Act.
		$result = $prop_type->units( $custom_units );
		$settings = $prop_type->get_settings();

		$expected = [ 'px', 'em', 'rem' ];

		// Assert.
		$this->assertSame( $prop_type, $result, 'units() should return self for method chaining' );
		$this->assertArrayHasKey( 'available_units', $settings );
		$this->assertEquals( $expected, $settings['available_units'] );
	}

	public function test_units_method_defaults_to_all_when_no_parameter() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Act.
		$settings = $prop_type->get_settings();

		$expected = ['px', 'ch', 'em', 'rem', 'vw', 'vh', '%', 'auto', 'custom'];

		// Assert.
		$this->assertEqualsCanonicalizing( $expected, $settings['available_units'] );
	}

	public function test_default_unit_method_sets_default_unit_in_settings() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();
		$default_unit = 'rem';

		// Act.
		$result = $prop_type->default_unit( $default_unit );
		$settings = $prop_type->get_settings();

		$expected = 'rem';

		// Assert.
		$this->assertSame( $prop_type, $result, 'default_unit() should return self for method chaining' );
		$this->assertArrayHasKey( 'default_unit', $settings );
		$this->assertEquals( $expected, $settings['default_unit'] );
	}

	public function test_units_method_with_typography_context() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Act.
		$prop_type->units( Size_Constants::typography() );

		$settings = $prop_type->get_settings();

		// Assert.
		$this->assertNotContains( 'auto', $settings['available_units'] );
		$this->assertContains( 'px', $settings['available_units'] );
		$this->assertContains( 'em', $settings['available_units'] );
		$this->assertContains( 'rem', $settings['available_units'] );
		$this->assertContains( '%', $settings['available_units'] );
	}

	public function test_initial_value_with_size_prop_type() {
		// Arrange.
		$prop_type = Size_Prop_Type::make()->initial_value( [
			'size' => 24,
			'unit' => 'vh',
		] );

		// Act.
		$result = $prop_type->get_initial_value();

		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 24,
				'unit' => 'vh',
			],
		];

		// Assert.
		$this->assertEquals( $expected, $result );
	}


	public function test_initial_value_is_included_in_json_serialization() {
		// Arrange.
		$prop_type = Size_Prop_Type::make()->initial_value( [
			'size' => 32,
			'unit' => 'rem',
		] );

		// Act.
		$serialized = $prop_type->jsonSerialize();

		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 32,
				'unit' => 'rem',
			],
		];

		// Assert.
		$this->assertSame( $expected, $serialized['initial_value'] );
	}

	public function test_initial_value_is_null_when_not_set() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Act.
		$result = $prop_type->get_initial_value();

		// Assert.
		$this->assertNull( $result );
	}
}
