<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\Components\PropTypes\Component_Overridable_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Overridable_Prop_Type extends Elementor_Test_Base {

	public function test_validate__passes_with_valid_string_prop() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-override-key',
				'default_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_with_valid_number_prop() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( Number_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-number-key',
				'default_value' => [ '$$type' => 'number', 'value' => 42 ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__fails_with_missing_override_key() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'default_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_string_override_key() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 123,
				'default_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_missing_default_value() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-key',
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_default_value() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-key',
				'default_value' => 'not-an-array',
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_input() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( 'not-an-array' );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_invalid_default_value_type() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-key',
				'default_value' => [ '$$type' => 'string', 'value' => 123 ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_origin_prop_type_not_set() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make();

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-key',
				'default_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_override_key_and_default_value() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => ' <script>alert(1)</script>my-key ',
				'default_value' => [ '$$type' => 'string', 'value' => ' <script>alert(2)</script>Text ' ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'my-key',
				'default_value' => [ '$$type' => 'string', 'value' => ' Text ' ],
			],
		], $result );
	}

	public function test_sanitize__sanitizes_with_number_prop_type() {
		// Arrange
		$prop_type = Component_Overridable_Prop_Type::make()
			->set_origin_prop_type( Number_Prop_Type::make() );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => ' number-key ',
				'default_value' => [ '$$type' => 'number', 'value' => '42' ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-overridable',
			'value' => [
				'override_key' => 'number-key',
				'default_value' => [ '$$type' => 'number', 'value' => 42 ],
			],
		], $result );
	}
}
