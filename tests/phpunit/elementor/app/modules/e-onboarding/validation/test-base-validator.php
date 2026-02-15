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
		];
	}
}

class Test_Base_Validator extends TestCase {

	private Test_Validator $validator;

	public function setUp(): void {
		parent::setUp();
		$this->validator = new Test_Validator();
	}

	public function test_validates_all_types_correctly() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => 'test string',
			'int_field' => 42,
			'bool_field' => true,
			'array_field' => [ 'item1', 'item2' ],
			'string_array_field' => [ 'a', 'b', 'c' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'test string', $result['string_field'] );
		$this->assertSame( 42, $result['int_field'] );
		$this->assertTrue( $result['bool_field'] );
		$this->assertSame( [ 'item1', 'item2' ], $result['array_field'] );
		$this->assertSame( [ 'a', 'b', 'c' ], $result['string_array_field'] );
	}

	public function test_rejects_invalid_types() {
		// Assert - non-numeric for int
		$result = $this->validator->validate( [ 'int_field' => 'not a number' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - non-array for array
		$result = $this->validator->validate( [ 'array_field' => 'not an array' ] );
		$this->assertInstanceOf( \WP_Error::class, $result );

		// Assert - null for required string
		$result = $this->validator->validate( [ 'required_string' => null ] );
		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_allows_null_for_nullable_fields() {
		// Act
		$result = $this->validator->validate( [ 'string_field' => null ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNull( $result['string_field'] );
	}

	public function test_ignores_unknown_fields() {
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

	public function test_sanitizes_html_in_strings() {
		// Act
		$result = $this->validator->validate( [
			'string_field' => '<script>evil</script>test',
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertStringNotContainsString( '<script>', $result['string_field'] );
	}

	public function test_string_array_filters_non_strings() {
		// Act
		$result = $this->validator->validate( [
			'string_array_field' => [ 'a', 123, 'b', null, 'c' ],
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'a', 'b', 'c' ], $result['string_array_field'] );
	}
}
