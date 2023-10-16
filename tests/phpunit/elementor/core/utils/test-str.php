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

	public function test_sanitize_string() {
		$input = "<script>alert('XSS');</script>";
		$output = Str::sanitize_input_string_or_array( $input );
		$this->assertEquals( '', $output );
	}

	public function test_sanitize_array() {
		$input = [
			"<script>alert('XSS1');</script>",
			"<script>alert('XSS2');</script>",
		];
		$output = Str::sanitize_input_string_or_array( $input );
		$expected = [
			'',
			'',
		];
		$this->assertEquals( $expected, $output );
	}

	public function test_sanitize_nested_array() {
		$input = [
			"<script>alert('XSS1');</script>",
			[
				"<script>alert('Nested');</script>",
				'Safe String',
			],
		];
		$output = Str::sanitize_input_string_or_array( $input );
		$expected = [
			'',
			[
				'',
				'Safe String',
			],
		];
		$this->assertEquals( $expected, $output );
	}

	public function test_non_string_or_array() {
		$input = 123;
		$output = Str::sanitize_input_string_or_array( $input );
		$this->assertEquals( 123, $output );
	}
}
