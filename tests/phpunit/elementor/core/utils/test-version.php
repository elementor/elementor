<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Version;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Version extends Elementor_Test_Base {
	/** @dataProvider create_version_data_provider */
	public function test_create_from_string( $version, $expected ) {
		// Act
		$version = Version::create_from_string( $version );

		// Assert
		$this->assertEquals( $expected[0], $version->major1 );
		$this->assertEquals( $expected[1], $version->major2 );
		$this->assertEquals( $expected[2], $version->patch );
		$this->assertEquals( $expected[3], $version->stage );
	}

	public function create_version_data_provider() {
		return [
			[ '3.1.1-dev1', [ '3', '1', '1', 'dev1' ] ],
			[ '3.1.1', [ '3', '1', '1', null ] ],
			[ '1.0.1-beta', [ '1', '0', '1', 'beta' ] ],
			[ '1.0', [ '1', '0', '0', null ] ],
			[ '3', [ '3', '0', '0', null ] ],
		];
	}

	public function test_create_from_string__should_throw_exception_if_send_an_invalid_version() {
		// Assert (expect)
		$this->expectException( \Exception::class );

		// Act
		$version = Version::create_from_string( 'a.b' );
	}

	/** @dataProvider is_valid_data_provider */
	public function test_is_valid_version( $version, $is_valid ) {
		// Act
		$result = Version::is_valid_version( $version );

		// Assert
		$this->assertEquals( $is_valid, $result );
	}

	public function is_valid_data_provider() {
		return [
			// Valid versions.
			[ '3.1.1-dev1', true ],
			[ '3.1.1', true ],
			[ '3.1', true ],
			[ '3', true ],
			[ '0.0.0', true ],

			// Invalid versions.
			[ 'a', false ],
			[ 'a.v', false ],
			[ '1.a.0-dev', false ],
			[ '1.0.a', false ],
			[ 'text', false ],
		];
	}

	/** @dataProvider compare_versions_data_provider__only_major2_checks */
	public function test_compare($operator, $version2, $part, $expected) {
		// Arrange
		$version = Version::create_from_string( '2.0.5' );

		// Act
		$result = $version->compare( $operator, $version2, $part );

		// Assert
		$this->assertEquals( $expected, $result );
	}

	public function compare_versions_data_provider__only_major2_checks() {
		return [
			[ '=', '2.0.0', Version::PART_MAJOR_2, true ],
			[ '=', '2.0.3', Version::PART_MAJOR_2, true ],
			[ '=', '2.0.7', Version::PART_MAJOR_2, true ],
			[ '=', '2.1.0', Version::PART_MAJOR_2, false ],
			[ '=', '1.9.0', Version::PART_MAJOR_2, false ],
			[ '=', '3.0.0', Version::PART_MAJOR_2, false ],

			[ '<', '2.1.0', Version::PART_MAJOR_2, true ],
			[ '<', '2.1.3', Version::PART_MAJOR_2, true ],
			[ '<', '2.0.0', Version::PART_MAJOR_2, false ],
			[ '<', '2.0.5', Version::PART_MAJOR_2, false ],

			[ '>', '1.9.0', Version::PART_MAJOR_2, true ],
			[ '>', '1.12.0', Version::PART_MAJOR_2, true ],
			[ '>', '1.12.12', Version::PART_MAJOR_2, true ],
			[ '>', '2.0.0', Version::PART_MAJOR_2, false ],
			[ '>', '2.0.5', Version::PART_MAJOR_2, false ],
		];
	}
}
