<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Str;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Str extends Elementor_Test_Base {

	/**
	 * Assert that `Str::encode_idn_url()` encodes non-IDN URLs properly.
	 */
	public function test_encode_idn_url__encodes_non_idn_url() {
		// Arrange.
		$url = 'https://www.example.com/some/path/to/file.php';
		$expected = $url;

		// Act.
		$encoded_url = Str::encode_idn_url( $url );

		// Assert.
		$this->assertEquals( $expected, $encoded_url );
	}

	/**
	 * Assert that `Str::encode_idn_url()` encodes IDN URLs properly.
	 */
	public function test_encode_idn_url__encodes_idn_url() {
		// Arrange.
		$url = 'https://é.com/some/path/to/file.php';
		$expected = 'https://xn--9ca.com/some/path/to/file.php';

		// Act.
		$encoded_url = Str::encode_idn_url( $url );

		// Assert.
		$this->assertEquals( $expected, $encoded_url );
	}

	public function test_ends_with() {
		// Arrange
		$str1 = 'test-str';
		$str2 = 'test-str-2';

		// Act & Assert
		$this->assertTrue( Str::ends_with( $str1, 'str' ) );
		$this->assertFalse( Str::ends_with( $str2, 'str' ) );
	}

	/**
	 * Test hash_string returns a positive integer.
	 */
	public function test_hash_string__returns_positive_integer() {
		// Act
		$result = Str::hash_string( 'test' );

		// Assert
		$this->assertIsInt( $result );
		$this->assertGreaterThan( 0, $result );
	}

	/**
	 * Test hash_string is deterministic (same input = same output).
	 */
	public function test_hash_string__is_deterministic() {
		// Arrange
		$input = 'instance-abc-123';

		// Act
		$hash1 = Str::hash_string( $input );
		$hash2 = Str::hash_string( $input );
		$hash3 = Str::hash_string( $input );

		// Assert
		$this->assertEquals( $hash1, $hash2 );
		$this->assertEquals( $hash2, $hash3 );
	}

	/**
	 * Test hash_string generates different hashes for different inputs.
	 */
	public function test_hash_string__different_inputs_different_hashes() {
		// Act
		$hash1 = Str::hash_string( 'instance-a' );
		$hash2 = Str::hash_string( 'instance-b' );
		$hash3 = Str::hash_string( 'instance-c' );

		// Assert
		$this->assertNotEquals( $hash1, $hash2 );
		$this->assertNotEquals( $hash2, $hash3 );
		$this->assertNotEquals( $hash1, $hash3 );
	}

	/**
	 * Test hash_string handles empty string (returns FNV offset basis).
	 */
	public function test_hash_string__empty_string() {
		// Act
		$result = Str::hash_string( '' );

		// Assert
		$this->assertEquals( 2166136261, $result ); // FNV offset basis
	}

	/**
	 * Test hash_string is sensitive to character order.
	 */
	public function test_hash_string__character_order_matters() {
		// Act
		$hash1 = Str::hash_string( 'abc' );
		$hash2 = Str::hash_string( 'cba' );

		// Assert
		$this->assertNotEquals( $hash1, $hash2 );
	}

	/**
	 * Test hash_to_short_id converts hash to base36 string.
	 */
	public function test_hash_to_short_id__converts_to_base36() {
		// Arrange
		$hash = 123456789;

		// Act
		$result = Str::hash_to_short_id( $hash );

		// Assert
		$this->assertIsString( $result );
		$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
	}

	/**
	 * Test hash_to_short_id respects length parameter.
	 */
	public function test_hash_to_short_id__respects_length() {
		// Arrange
		$hash = 123456789;

		// Act
		$result5 = Str::hash_to_short_id( $hash, 5 );
		$result7 = Str::hash_to_short_id( $hash, 7 );
		$result10 = Str::hash_to_short_id( $hash, 10 );

		// Assert
		$this->assertLessThanOrEqual( 5, strlen( $result5 ) );
		$this->assertLessThanOrEqual( 7, strlen( $result7 ) );
		$this->assertLessThanOrEqual( 10, strlen( $result10 ) );
	}

	/**
	 * Test generate_short_hash combines hashing and base36 conversion.
	 */
	public function test_generate_short_hash__combines_operations() {
		// Arrange
		$input = 'test-string';

		// Act
		$direct_result = Str::generate_short_hash( $input );
		$manual_result = Str::hash_to_short_id( Str::hash_string( $input ) );

		// Assert
		$this->assertEquals( $direct_result, $manual_result );
	}

	/**
	 * Test generate_short_hash is deterministic.
	 */
	public function test_generate_short_hash__is_deterministic() {
		// Arrange
		$input = 'instance-abc_instance-xyz';

		// Act
		$result1 = Str::generate_short_hash( $input );
		$result2 = Str::generate_short_hash( $input );

		// Assert
		$this->assertEquals( $result1, $result2 );
	}

	/**
	 * Test generate_short_hash generates short alphanumeric strings.
	 */
	public function test_generate_short_hash__short_output() {
		// Arrange
		$inputs = [
			'short',
			'very-long-instance-chain-with-many-components',
			'inst1_inst2_inst3_inst4_inst5',
		];

		// Act & Assert
		foreach ( $inputs as $input ) {
			$result = Str::generate_short_hash( $input );
			$this->assertLessThanOrEqual( 7, strlen( $result ) );
			$this->assertMatchesRegularExpression( '/^[0-9a-z]+$/', $result );
		}
	}

	/**
	 * Test generate_short_hash generates different hashes for nested chains.
	 */
	public function test_generate_short_hash__different_chains() {
		// Arrange
		$chain1 = 'inst-a';
		$chain2 = 'inst-a_inst-b';
		$chain3 = 'inst-a_inst-b_inst-c';

		// Act
		$hash1 = Str::generate_short_hash( $chain1 );
		$hash2 = Str::generate_short_hash( $chain2 );
		$hash3 = Str::generate_short_hash( $chain3 );

		// Assert
		$this->assertNotEquals( $hash1, $hash2 );
		$this->assertNotEquals( $hash2, $hash3 );
		$this->assertNotEquals( $hash1, $hash3 );
	}

	/**
	 * Test that PHP and TypeScript implementations produce the same hash.
	 *
	 * This is critical for consistency between server and client.
	 */
	public function test_hash_string__matches_typescript_implementation() {
		// Arrange - test cases with known TypeScript hash values
		$test_cases = [
			[ 'input' => 'test', 'expected' => 2949673445 ],
			[ 'input' => 'instance-abc', 'expected' => 3651313539 ],
			[ 'input' => 'inst1_inst2_inst3', 'expected' => 2057421811 ],
		];

		// Act & Assert
		foreach ( $test_cases as $test ) {
			$result = Str::hash_string( $test['input'] );
			$this->assertEquals(
				$test['expected'],
				$result,
				"Hash for '{$test['input']}' should match TypeScript implementation"
			);
		}
	}
}
