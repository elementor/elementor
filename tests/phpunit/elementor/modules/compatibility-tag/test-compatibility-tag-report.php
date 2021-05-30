<?php
namespace Elementor\Testing\Modules\CompatibilityTag;

use Elementor\Core\Utils\Version;
use Elementor\Core\Utils\Collection;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Modules\CompatibilityTag\Compatibility_Tag;
use Elementor\Modules\CompatibilityTag\Compatibility_Tag_Report;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Compatibility_Tag_Report extends Elementor_Test_Base {
	public function test_get_report_data() {
		// Arrange
		$report = $this->create_instance();

		// Act
		$result = $report->get_report_data();

		// Assert
		$this->assertArrayHasKey( 'value', $result );
		$this->assertEqualSets( [
			'a' => Compatibility_Tag::COMPATIBLE,
			'b' => Compatibility_Tag::INCOMPATIBLE,
		], $result['value'] );
	}

	public function test_get_report_data__with_html_format() {
		// Arrange
		$report = $this->create_instance( 'html' );

		// Act
		$result = $report->get_report_data();

		// Assert
		$this->assertArrayHasKey( 'value', $result );
		$this->assertRegExp( '/<tr><td> A <\/td><td> Compatible <\/td><\/tr>/', $result['value'] );
		$this->assertRegExp( '/<tr><td> B <\/td><td> Incompatible <\/td><\/tr>/', $result['value'] );
	}

	public function test_get_report_data__with_raw_format() {
		// Arrange
		$report = $this->create_instance( 'raw' );

		// Act
		$result = $report->get_report_data();

		// Assert
		$this->assertArrayHasKey( 'value', $result );
		$this->assertRegExp( '/A: Compatible/', $result['value'] );
		$this->assertRegExp( '/B: Incompatible/', $result['value'] );
	}

	/**
	 * @param string $format
	 *
	 * @return Compatibility_Tag_Report
	 * @throws \Exception
	 */
	private function create_instance( $format = '' ) {
		$this->mock_wp_api(
			[
				'get_plugins' => new Collection( [
					'a' => [ 'Name' => 'A' ],
					'b' => [ 'Name' => 'B' ],
				] )
			]
		);

		$compatibility_tag_service = $this->getMockBuilder( Compatibility_Tag::class )
			->setConstructorArgs( [ 'a' ] )
			->getMock();

		$compatibility_tag_service->method( 'check' )
			->willReturn( [
			  'a' => Compatibility_Tag::COMPATIBLE,
			  'b' => Compatibility_Tag::INCOMPATIBLE,
			] );

		return new Compatibility_Tag_Report(
			[
				'format' => $format,
				'fields' => [
					'compatibility_tag_service' => $compatibility_tag_service,
					'plugin_label'              => 'Elementor',
					'plugin_version'            => Version::create_from_string( '3.0.0' ),
					'plugins_to_check'          => [ 'a', 'b' ],
				],
			]
		);
	}
}
