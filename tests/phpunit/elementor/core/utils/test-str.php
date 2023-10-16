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
		// Arrange
		$input = "<script>alert('XSS');</script>";

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals("alert('XSS');", $output);
	}

	public function test_sanitize_array() {
		// Arrange
		$input = [
			"<script>alert('XSS1');</script>",
			"<script>alert('XSS2');</script>",
		];
		$expected = [
			"alert('XSS1');",
			"alert('XSS2');"
		];

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( $expected, $output );
	}

	public function test_sanitize_nested_array() {
		// Arrange
		$input = [
			"<script>alert('XSS1');</script>",
			[
				"<script>alert('Nested');</script>",
				'Safe String',
			],
		];
		$expected = [
			"alert('XSS1');",
			[
				"alert('Nested');",
				"Safe String"
			]
		];

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( $expected, $output );
	}

	public function test_sanitize_associative_array() {
		// Arrange
		$input = [
			'key1' => "<script>alert('XSS1');</script>",
			'key2' => 'Safe String',
		];
		$expected = [
			'key1' => "alert('XSS1');",
			'key2' => 'Safe String'
		];

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( $expected, $output );
	}

	public function test_array_with_different_data_types() {
		// Arrange
		$input = [
			"<script>alert('XSS');</script>",
			12345,
			true,
			null,
		];
		$expected = [
			"alert('XSS');",
			12345,
			true,
			null
		];

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( $expected, $output );
	}

	public function test_deeply_nested_arrays() {
		// Arrange
		$input = [
			"<script>alert('XSS1');</script>",
			[
				"<script>alert('Nested');</script>",
				'Safe String',
				[
					'Deeper' => [
						"<script>alert('Even Deeper');</script>",
						'Another Safe String',
					],
				],
			],
		];
		$expected = [
			"alert('XSS1');",
			[
				"alert('Nested');",
				"Safe String",
				[
					'Deeper' => [
						"alert('Even Deeper');",
						"Another Safe String"
					]
				]
			]
		];

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( $expected, $output );
	}

	public function test_html_entities() {
		// Arrange
		$input = "Hello &amp; World";

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( "Hello &amp; World", $output );
	}

	public function test_basic_html() {
		// Arrange
		$input = "<b>Bold</b> <i>Italic</i>";

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals( "<b>Bold</b> <i>Italic</i>", $output );
	}

	public function test_multiple_sanitizable_parts() {
		// Arrange
		$input = "<script>alert('1');</script>Hello<script>alert('2');</script>World";

		// Act
		$output = Str::sanitize_input_string_or_array( $input );

		// Assert
		$this->assertEquals("alert('1');Helloalert('2');World", $output);
	}
}
