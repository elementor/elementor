<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Format_Component_Elements_Id;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Format_Component_Elements_Id extends Elementor_Test_Base {

	const ELEMENT_IDS = [ '32975a4', '3ddd07a', 'ff531ef', '8f7a2dc', 'b559a00' ];

	public function test_hash_string__returns_same_hash_for_same_input() {
		// Arrange
		$input = 'test-string-123';

		// Act
		$hash1 = Format_Component_Elements_Id::hash_string( $input, null );
		$hash2 = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertEquals( $hash1, $hash2 );
	}

	public function test_hash_string__returns_same_hash_for_same_input_when_passing_a_length_parameter() {
		// Arrange
		$input = 'test-string-123';
		$length = 6;

		// Act
		$hash1 = Format_Component_Elements_Id::hash_string( $input, $length );
		$hash2 = Format_Component_Elements_Id::hash_string( $input, $length );

		// Assert
		$this->assertEquals( $hash1, $hash2 );
	}

	public function test_hash_string__returns_different_hashes_for_different_inputs() {
		// Arrange
		$input1 = 'hello';
		$input2 = 'world';

		// Act
		$hash1 = Format_Component_Elements_Id::hash_string( $input1, null );
		$hash2 = Format_Component_Elements_Id::hash_string( $input2, null );

		// Assert
		$this->assertNotEquals( $hash1, $hash2 );
	}

	public function test_hash_string__returns_different_hashes_for_similar_inputs() {
		// Arrange
		$input1 = 'test-string-123-123';
		$input2 = 'test-string-124-123';

		// Act
		$hash1 = Format_Component_Elements_Id::hash_string( $input1, null );
		$hash2 = Format_Component_Elements_Id::hash_string( $input2, null );

		// Assert
		$this->assertNotEquals( $hash1, $hash2 );
	}

	/**
	 * @dataProvider provide_test_inputs
	 */
	public function test_hash_string__result_contains_only_lowercase_letters_and_numbers( $input ) {
		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
	}

	public function provide_test_inputs() {
		return [
			[ 'test' ],
			[ 'hello-world' ],
			[ '12345' ],
			[ 'abc-xyz-123' ],
		];
	}

	public function test_hash_string__returns_string_with_length_parameter() {
		// Arrange
		$input = 'test-string-123';
		$length = 5;

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, $length );

		// Assert
		$this->assertEquals( 5, strlen( $result ) );
	}

	public function test_hash_string__handles_empty_string() {
		// Arrange
		$input = '';

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertNotEmpty( $result );
		$this->assertIsString( $result );
	}

	public function test_hash_string__handles_very_long_strings() {
		// Arrange
		$input = str_repeat( 'a', 10000 );

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertIsString( $result );
		$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
	}

	public function test_hash_string__handles_special_characters() {
		// Arrange
		$input = '!@#$%^&*()_+-=[]{}|;:,.<>?';

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
	}

	public function test_hash_string__handles_unicode_characters() {
		// Arrange
		$input = 'שלום עולם 你好 مرحبا';

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, null );

		// Assert
		$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
	}

	public function test_hash_string__handles_length_larger_than_hash_length() {
		// Arrange
		$input = 'a';
		$length = 20;

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, $length );

		// Assert
		$this->assertLessThanOrEqual( $length, strlen( $result ) );
	}

	public function test_hash_string__pads_with_zeros_when_hash_is_shorter_than_max_length() {
		// Arrange
		$input = 'b559a00_32975a4_ff531ef';
		$length = 7;

		// Act
		$result = Format_Component_Elements_Id::hash_string( $input, $length );

		// Assert
		$this->assertEquals( '0dr4k', $result );
		$this->assertEquals( 7, strlen( $result ) );
	}

	public function test_hash_string__matches_typescript_implementation() {
		// Arrange
		$test_cases = [
			'b559a00_32975a4' => '1b1w3wv',
			'b559a00_32975a4_3ddd07a' => '1ose7z5',
			'b559a00_32975a4_ff531ef' => '0dr8u4k',
			'b559a00_32975a4_ff531ef_8f7a2dc' => '10muleu',
		];

		// Act & Assert
		foreach ( $test_cases as $input => $expected ) {
			$result = Format_Component_Elements_Id::hash_string( $input, 7 );
			$this->assertEquals( $expected, $result, "Failed for input: $input" );
			$this->assertEquals( 7, strlen( $result ), "Length mismatch for input: $input" );
		}
	}

	public function test_format__formats_single_element_with_hashed_id() {
		// Arrange
		$element_id = self::ELEMENT_IDS[0];
		$instance_id = self::ELEMENT_IDS[1];

		$elements = [
			[
				'id' => $element_id,
				'elType' => 'e-flexbox',
				'elements' => [],
			],
		];
		$path = [ $instance_id ];

		// Act
		$result = Format_Component_Elements_Id::format( $elements, $path );

		// Assert
		$this->assertEquals( '1e00vc4', $result[0]['id'] );
		$this->assertEquals( 'e-flexbox', $result[0]['elType'] );
		$this->assertIsArray( $result[0]['elements'] );
	}

	public function test_format__preserves_all_element_properties_except_id() {
		// Arrange
		$element_id = self::ELEMENT_IDS[0];
		$instance_id = self::ELEMENT_IDS[1];

		$elements = [
			[
				'id' => $element_id,
				'elType' => 'widget',
				'widgetType' => 'button',
				'settings' => [ 'text' => 'Click me' ],
				'editor_settings' => [ 'title' => 'My Button' ],
				'elements' => [],
			],
		];
		$path = [ $instance_id ];

		// Act
		$result = Format_Component_Elements_Id::format( $elements, $path );

		// Assert
		$this->assertEquals( '1e00vc4', $result[0]['id'] );
		$this->assertEquals( 'widget', $result[0]['elType'] );
		$this->assertEquals( 'button', $result[0]['widgetType'] );
		$this->assertEquals( [ 'text' => 'Click me' ], $result[0]['settings'] );
		$this->assertEquals( [ 'title' => 'My Button' ], $result[0]['editor_settings'] );
		$this->assertIsArray( $result[0]['elements'] );
	}

	public function test_format__recursively_formats_nested_elements() {
		// Arrange
		$parent_id = self::ELEMENT_IDS[0];
		$child_id1 = self::ELEMENT_IDS[1];
		$child_id2 = self::ELEMENT_IDS[2];
		$child_id3 = self::ELEMENT_IDS[3];
		$instance_id = self::ELEMENT_IDS[4];

		$elements = [
			[
				'id' => $parent_id,
				'elType' => 'e-div-block',
				'elements' => [
					[
						'id' => $child_id1,
						'elType' => 'widget',
						'elements' => [],
					],
					[
						'id' => $child_id2,
						'elType' => 'e-flexbox',
						'elements' => [
							[
								'id' => $child_id3,
								'elType' => 'widget',
								'elements' => [],
							],
						],
					],
				],
			],
		];
		$path = [ $instance_id ];

		// Act
		$result = Format_Component_Elements_Id::format( $elements, $path );

		// Assert
		$this->assertEquals( '1b1w3wv', $result[0]['id'] );
		$this->assertEquals( '1ose7z5', $result[0]['elements'][0]['id'] );
		$this->assertEquals( '0dr8u4k', $result[0]['elements'][1]['id'] );
		$this->assertEquals( '10muleu', $result[0]['elements'][1]['elements'][0]['id'] );
	}

	public function test_format__creates_same_id_for_same_element_with_same_path() {
		// Arrange
		$element_id = self::ELEMENT_IDS[0];
		$inner_instance_id = self::ELEMENT_IDS[1];
		$outer_instance_id = self::ELEMENT_IDS[2];

		$elements = [
			[
				'id' => $element_id,
				'elType' => 'e-flexbox',
				'elements' => [],
			],
		];
		$path = [ $outer_instance_id, $inner_instance_id ];

		// Act
		$result1 = Format_Component_Elements_Id::format( $elements, $path );
		$result2 = Format_Component_Elements_Id::format( $elements, $path );

		// Assert
		$this->assertEquals( $result1[0]['id'], $result2[0]['id'] );
	}

	public function test_format__creates_unique_ids_for_same_element_with_different_paths() {
		// Arrange
		$element_id = self::ELEMENT_IDS[0];
		$outer_instance_id = self::ELEMENT_IDS[1];
		$inner_instance_id1 = self::ELEMENT_IDS[2];
		$inner_instance_id2 = self::ELEMENT_IDS[3];

		$elements = [
			[
				'id' => $element_id,
				'elType' => 'e-flexbox',
				'elements' => [],
			],
		];

		$path1 = [ $outer_instance_id, $inner_instance_id1 ];
		$path2 = [ $outer_instance_id, $inner_instance_id2 ];

		// Act
		$result1 = Format_Component_Elements_Id::format( $elements, $path1 );
		$result2 = Format_Component_Elements_Id::format( $elements, $path2 );

		// Assert
		$this->assertNotEquals( $result1[0]['id'], $result2[0]['id'] );
	}
}
