<?php

use Elementor\Modules\DataFlow\State_Schema;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Schema extends TestCase {

	public function test_sanitize__keeps_valid_declarations_and_drops_invalid_ones() {
		// Arrange
		$declaration = [
			[ 'key' => 'rate', 'prop_type' => 'number', 'default' => '12' ],
			[ 'key' => 'style', 'prop_type' => 'enum', 'options' => [ 'a', 'b' ], 'default' => 'b' ],
			[ 'key' => 'tint', 'prop_type' => 'color', 'default' => '#ff0000' ],
			[ 'key' => 'bad key', 'prop_type' => 'string' ],
			[ 'key' => 'unknown', 'prop_type' => 'date' ],
			[ 'key' => 'no_options', 'prop_type' => 'enum' ],
			'not-an-array',
		];

		// Act
		$result = State_Schema::sanitize( $declaration );

		// Assert
		$this->assertSame( [ 'rate', 'style', 'tint' ], array_column( $result, 'key' ) );
		$this->assertSame( 12, $result[0]['default'] );
		$this->assertSame( 'b', $result[1]['default'] );
		$this->assertSame( [ 'a', 'b' ], $result[1]['options'] );
	}

	public function test_sanitize__falls_back_to_empty_value_when_default_is_invalid_for_prop_type() {
		// Arrange
		$declaration = [
			[ 'key' => 'style', 'prop_type' => 'enum', 'options' => [ 'a', 'b' ], 'default' => 'zzz' ],
			[ 'key' => 'rate', 'prop_type' => 'number', 'default' => 'abc' ],
		];

		// Act
		$result = State_Schema::sanitize( $declaration );

		// Assert
		$this->assertSame( 'a', $result[0]['default'] );
		$this->assertSame( 0, $result[1]['default'] );
	}

	public function test_sanitize__keeps_valid_exposed_controls_only() {
		// Arrange
		$declaration = [
			[ 'key' => 'rate', 'prop_type' => 'number', 'exposed' => [ 'control' => 'number', 'label' => 'Rate' ] ],
			[ 'key' => 'flag', 'prop_type' => 'boolean', 'exposed' => [ 'control' => 'switch' ] ],
			[ 'key' => 'wrong', 'prop_type' => 'number', 'exposed' => [ 'control' => 'textarea', 'label' => 'x' ] ],
			[ 'key' => 'data', 'prop_type' => 'json', 'exposed' => [ 'control' => 'text', 'label' => 'x' ] ],
		];

		// Act
		$result = State_Schema::sanitize( $declaration );

		// Assert
		$this->assertSame( [ 'control' => 'number', 'label' => 'Rate' ], $result[0]['exposed'] );
		$this->assertSame( [ 'control' => 'switch', 'label' => 'flag' ], $result[1]['exposed'] );
		$this->assertArrayNotHasKey( 'exposed', $result[2] );
		$this->assertArrayNotHasKey( 'exposed', $result[3] );
	}

	public function test_sanitize__caps_exposed_controls_and_keeps_extra_keys_internal() {
		// Arrange
		$declaration = array_map( fn( $index ) => [
			'key' => 'key_' . $index,
			'prop_type' => 'number',
			'exposed' => [ 'control' => 'number', 'label' => 'Key ' . $index ],
		], range( 1, State_Schema::MAX_EXPOSED_CONTROLS + 2 ) );

		// Act
		$result = State_Schema::sanitize( $declaration );

		// Assert
		$this->assertCount( State_Schema::MAX_EXPOSED_CONTROLS + 2, $result );
		$this->assertCount( State_Schema::MAX_EXPOSED_CONTROLS, array_filter( $result, fn( $param ) => isset( $param['exposed'] ) ) );
	}

	public function test_sanitize_values__validates_each_value_against_its_prop_type() {
		// Arrange
		$declaration = State_Schema::sanitize( [
			[ 'key' => 'rate', 'prop_type' => 'number', 'default' => 1 ],
			[ 'key' => 'style', 'prop_type' => 'enum', 'options' => [ 'a', 'b' ], 'default' => 'a' ],
			[ 'key' => 'on', 'prop_type' => 'boolean', 'default' => false ],
		] );

		// Act
		$result = State_Schema::sanitize_values( $declaration, [
			'rate' => '7',
			'style' => 'nope',
			'on' => true,
			'unknown' => 'x',
		] );

		// Assert
		$this->assertSame( [ 'rate' => 7, 'on' => true ], $result['values'] );
		$this->assertSame( [ 'style' ], $result['invalid_keys'] );
		$this->assertSame( [ 'unknown' ], $result['unknown_keys'] );
	}

	public function test_sanitize_values__accepts_size_values_as_typed_props() {
		// Arrange
		$declaration = State_Schema::sanitize( [ [ 'key' => 'gap', 'prop_type' => 'size' ] ] );

		// Act
		$valid = State_Schema::sanitize_values( $declaration, [
			'gap' => [ '$$type' => 'size', 'value' => [ 'size' => 10, 'unit' => 'px' ] ],
		] );
		$invalid = State_Schema::sanitize_values( $declaration, [ 'gap' => 'wide' ] );

		// Assert
		$this->assertSame( [ 'gap' ], array_keys( $valid['values'] ) );
		$this->assertSame( [ 'gap' ], $invalid['invalid_keys'] );
	}

	public function test_to_params__maps_to_the_legacy_param_shape_for_scopes() {
		// Arrange
		$declaration = State_Schema::sanitize( [
			[ 'key' => 'rate', 'prop_type' => 'number', 'default' => 2 ],
			[ 'key' => 'data', 'prop_type' => 'json', 'default' => [ 1 ] ],
			[ 'key' => 'style', 'prop_type' => 'enum', 'options' => [ 'a' ], 'default' => 'a' ],
		] );

		// Act
		$params = State_Schema::to_params( $declaration );

		// Assert
		$this->assertSame( [ 'number', 'json', 'string' ], array_column( $params, 'type' ) );
	}
}
