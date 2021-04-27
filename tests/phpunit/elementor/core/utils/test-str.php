<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Str;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_String extends Elementor_Test_Base {

	/**
	 * Assert that `Str::encode_idn_url()` encodes non-IDN URLs properly.
	 */
	public function test_encode_idn_url_encodes_non_idn_url() {
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
	public function test_encode_idn_url_encodes_idn_url() {
		// Arrange.
		$url = 'https://é.com/some/path/to/file.php';
		$expected = 'https://xn--9ca.com/some/path/to/file.php';

		// Act.
		$encoded_url = Str::encode_idn_url( $url );

		// Assert.
		$this->assertEquals( $expected, $encoded_url );
	}
}
