<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Overridable_Prop_Type extends Elementor_Test_Base {

	public function test_validate__passes_with_origin_value_matching_origin_prop_type() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-override-key',
				'origin_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function invalid_structure_data_provider() {
		return [
			'non-array value' => [ 'not-an-array' ],
			'missing_override_key' => [ [
				'origin_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			] ],
			'non-string override_key' => [ [
				'override_key' => 123,
				'origin_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			] ],
			'missing_origin_value' => [ [
				'override_key' => 'my-override-key',
			] ],
			'non-array origin_value' => [ [
				'override_key' => 'my-override-key',
				'origin_value' => 'not-an-array',
			] ],
		];
	}

	/**
	 * @dataProvider invalid_structure_data_provider
	 */
	public function test_validate__fail_for_invalid_structure( $value ) {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act.
		$result = $prop_type->validate( $value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__passes_with_null_origin_value() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-override-key',
				'origin_value' => null,
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_sanitize__handles_null_origin_value() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-override-key',
				'origin_value' => null,
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-override-key',
				'origin_value' => null,
			],
		], $result );
	}

	public function test_validate__fails_when_origin_value_invalid_against_origin_prop_type() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( 
				String_Prop_Type::make()
					->enum( [ 'p', 'span' ] )
					->default( 'p' ) 
			);

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-key',
				'origin_value' => [ '$$type' => 'string', 'value' => 'not-in-enum' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_origin_prop_type_not_set() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make();

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'my-key',
				'origin_value' => [ '$$type' => 'string', 'value' => 'Default Text' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_override_key_and_origin_value() {
		// Arrange
		$prop_type = Overridable_Prop_Type::make()
			->set_origin_prop_type( String_Prop_Type::make() );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => ' <script>alert(1)</script>my-key ',
				'origin_value' => [ '$$type' => 'string', 'value' => '<script>alert(2)</script>Text' ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'overridable',
			'value' => [
				'override_key' => 'scriptalert1scriptmy-key',
				'origin_value' => [ '$$type' => 'string', 'value' => 'Text' ],
			],
		], $result );
	}
}
