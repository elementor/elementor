<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Validation;

use Elementor\App\Modules\E_Onboarding\Validation\Base_Validator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Concrete implementation of Base_Validator for testing purposes.
 */
class Test_Validator extends Base_Validator {
	protected function get_rules(): array {
		return [
			'string_field' => [ 'type' => 'string', 'nullable' => true ],
			'required_string' => [ 'type' => 'string', 'nullable' => false ],
			'int_field' => [ 'type' => 'int', 'nullable' => false ],
			'bool_field' => [ 'type' => 'bool' ],
			'array_field' => [ 'type' => 'array', 'nullable' => false ],
			'string_array_field' => [ 'type' => 'string_array' ],
			'custom_data_field' => [ 'type' => 'custom_data' ],
		];
	}
}

class Test_Base_Validator extends TestCase {

	private Test_Validator $validator;

	public function setUp(): void {
		parent::setUp();
		$this->validator = new Test_Validator();
	}

	public function test_validate_returns_empty_array_for_empty_params() {
		// Act
		$result = $this->validator->validate( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_validate_string_accepts_valid_string() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => 'test string',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'test string', $result['string_field'] );
	}

	public function test_validate_string_accepts_null_when_nullable() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => null,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['string_field'] );
	}

	public function test_validate_string_rejects_null_when_not_nullable() {
		// Act
		$result = $this->validator->validate( [
			'required_string' => null,
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_required_string', $result->get_error_code() );
	}

	public function test_validate_string_rejects_non_string() {
		// Act
		$result = $this->validator->validate( [
			'required_string' => 123,
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_validate_int_accepts_numeric() {
		// Act
		$result = $this->validator->validate( [
			'int_field' => 42,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 42, $result['int_field'] );
	}

	public function test_validate_int_accepts_numeric_string() {
		// Act
		$result = $this->validator->validate( [
			'int_field' => '100',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 100, $result['int_field'] );
	}

	public function test_validate_int_rejects_non_numeric() {
		// Act
		$result = $this->validator->validate( [
			'int_field' => 'not a number',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_int_field', $result->get_error_code() );
	}

	public function test_validate_bool_accepts_true() {
		// Act
		$result = $this->validator->validate( [
			'bool_field' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['bool_field'] );
	}

	public function test_validate_bool_accepts_false() {
		// Act
		$result = $this->validator->validate( [
			'bool_field' => false,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertFalse( $result['bool_field'] );
	}

	public function test_validate_bool_converts_truthy_value() {
		// Act
		$result = $this->validator->validate( [
			'bool_field' => 1,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['bool_field'] );
	}

	public function test_validate_bool_converts_falsy_value() {
		// Act
		$result = $this->validator->validate( [
			'bool_field' => 0,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertFalse( $result['bool_field'] );
	}

	public function test_validate_array_accepts_valid_array() {
		// Act
		$result = $this->validator->validate( [
			'array_field' => [ 'item1', 'item2' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'item1', 'item2' ], $result['array_field'] );
	}

	public function test_validate_array_rejects_non_array() {
		// Act
		$result = $this->validator->validate( [
			'array_field' => 'not an array',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_array_field', $result->get_error_code() );
	}

	public function test_validate_string_array_accepts_valid_string_array() {
		// Act
		$result = $this->validator->validate( [
			'string_array_field' => [ 'a', 'b', 'c' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'a', 'b', 'c' ], $result['string_array_field'] );
	}

	public function test_validate_string_array_filters_non_strings() {
		// Act
		$result = $this->validator->validate( [
			'string_array_field' => [ 'a', 123, 'b', null, 'c' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'a', 'b', 'c' ], $result['string_array_field'] );
	}

	public function test_validate_string_array_rejects_non_array() {
		// Act
		$result = $this->validator->validate( [
			'string_array_field' => 'not an array',
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_string_array_field', $result->get_error_code() );
	}

	public function test_validate_custom_data_accepts_array() {
		// Act
		$result = $this->validator->validate( [
			'custom_data_field' => [
				'key' => 'value',
				'nested' => [ 'a' => 1 ],
			],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertIsArray( $result['custom_data_field'] );
	}

	public function test_validate_custom_data_sanitizes_values() {
		// Act
		$result = $this->validator->validate( [
			'custom_data_field' => [
				'key' => '<script>alert("xss")</script>value',
			],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( '<script>', $result['custom_data_field']['key'] );
	}

	public function test_validate_ignores_unknown_fields() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => 'test',
			'unknown_field' => 'ignored',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'string_field', $result );
		$this->assertArrayNotHasKey( 'unknown_field', $result );
	}

	public function test_validate_sanitizes_html_in_strings() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => '<b>bold</b> and <script>evil</script>',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( '<script>', $result['string_field'] );
		$this->assertStringNotContainsString( '<b>', $result['string_field'] );
	}

	public function test_validate_multiple_fields() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => 'test',
			'int_field' => 42,
			'bool_field' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'test', $result['string_field'] );
		$this->assertSame( 42, $result['int_field'] );
		$this->assertTrue( $result['bool_field'] );
	}

	public function test_validate_returns_error_on_first_invalid_field() {
		// Act - both fields are invalid
		$result = $this->validator->validate( [
			'required_string' => null,  // Invalid
			'int_field' => 'invalid',   // Also invalid
		] );

		// Assert - should return error for first invalid field
		$this->assertInstanceOf( \WP_Error::class, $result );
	}
}
