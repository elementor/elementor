<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Llm_Prop_Value_Adjuster;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Llm_Prop_Value_Adjuster extends Elementor_Test_Base {

	public function test_adjust__returns_null_for_non_array() {
		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( 'not an array' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_adjust__forces_type_from_options() {
		// Arrange
		$value = [
			'$$type' => 'wrong-type',
			'value' => 'test',
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value, [ 'force_key' => 'string' ] );

		// Assert
		$this->assertSame( 'string', $result['$$type'] );
	}

	public function test_adjust__removes_intention_key() {
		// Arrange
		$value = [
			'$$type' => 'string',
			'$intention' => 'some intention',
			'value' => 'test',
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertArrayNotHasKey( '$intention', $result );
		$this->assertSame( 'string', $result['$$type'] );
	}

	public function test_adjust__handles_size_with_nested_values() {
		// Arrange
		$value = [
			'$$type' => 'size',
			'value' => [
				'size' => [ '$$type' => 'number', 'value' => 16 ],
				'unit' => [ '$$type' => 'string', 'value' => 'px' ],
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertSame( 'size', $result['$$type'] );
		$this->assertSame( 16, $result['value']['size'] );
		$this->assertSame( 'px', $result['value']['unit'] );
	}

	public function test_adjust__defaults_size_unit_to_px() {
		// Arrange
		$value = [
			'$$type' => 'size',
			'value' => [
				'size' => 24,
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertSame( 'px', $result['value']['unit'] );
	}

	public function test_adjust__ensures_html_v3_has_children_array() {
		// Arrange
		$value = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [ '$$type' => 'string', 'value' => 'Test' ],
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertIsArray( $result['value']['children'] );
		$this->assertEmpty( $result['value']['children'] );
	}

	public function test_adjust__preserves_html_v3_existing_children() {
		// Arrange
		$value = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [ '$$type' => 'string', 'value' => 'Test' ],
				'children' => [
					[ '$$type' => 'string', 'value' => 'child' ],
				],
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertCount( 1, $result['value']['children'] );
	}

	public function test_adjust__calls_custom_transformer() {
		// Arrange
		$value = [
			'$$type' => 'custom-type',
			'value' => 'some-value',
		];
		$transformers = [
			'custom-type' => fn( $v ) => [
				'$$type' => 'transformed',
				'value' => 'transformed-' . $v,
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value, [ 'transformers' => $transformers ] );

		// Assert
		$this->assertSame( 'transformed', $result['$$type'] );
		$this->assertSame( 'transformed-some-value', $result['value'] );
	}

	public function test_adjust__recursively_adjusts_nested_objects() {
		// Arrange
		$value = [
			'$$type' => 'object',
			'value' => [
				'nested' => [
					'$$type' => 'html-v3',
					'value' => [
						'content' => [ '$$type' => 'string', 'value' => 'Nested' ],
					],
				],
			],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertIsArray( $result['value']['nested']['value']['children'] );
	}

	public function test_adjust__recursively_adjusts_arrays() {
		// Arrange
		$value = [
			[ '$$type' => 'html-v3', 'value' => [ 'content' => [ '$$type' => 'string', 'value' => 'A' ] ] ],
			[ '$$type' => 'html-v3', 'value' => [ 'content' => [ '$$type' => 'string', 'value' => 'B' ] ] ],
		];

		// Act
		$result = Llm_Prop_Value_Adjuster::adjust( $value );

		// Assert
		$this->assertIsArray( $result[0]['value']['children'] );
		$this->assertIsArray( $result[1]['value']['children'] );
	}

	public function test_create_global_variable_transformers__returns_empty_when_service_is_null() {
		// Act
		$result = Llm_Prop_Value_Adjuster::create_global_variable_transformers( null );

		// Assert
		$this->assertEmpty( $result );
	}
}
