<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\WP_Exporter;
use Elementor\Testing\Elementor_Test_Base;

class Test_WP_Exporter extends Elementor_Test_Base {
	/**
	 * @var array
	 */
	private $expected_error_list;

	/**
	 * @var bool|
	 */
	private $expected_errors_found;

	protected function expected_errors( $error_messages ) {
		$this->expected_error_list = (array) $error_messages;

		set_error_handler( [ &$this, 'expected_errors_handler' ] );
	}

	public function expected_errors_handler( $errno, $errstr ) {
		foreach ( $this->expected_error_list as $expect ) {

			if ( strpos( $errstr, $expect ) !== false ) {
				$this->expected_errors_found = true;

				return true;
			}
		}

		return false;
	}

	private function remove_xml_comments( $content = '' ) {
		return preg_replace( '/<!--(.|\s)*?-->/', '', $content );
	}

	private function remove_space_eols_and_tabulation( $content ) {
		return preg_replace('/[\s\t\n]/', '', $content);
	}

	private function remove_non_require_content( $content ) {
		$result = preg_replace( '/<generator>(.|\s)*?<\/generator>/', '', $content );
		$result = $this->remove_xml_comments( $result );
		$result = $this->remove_space_eols_and_tabulation( $result );

		return $result;
	}

	public function test__run() {
		// Arrange.
		require ABSPATH . 'wp-admin/includes/export.php';

		$this->expected_errors( 'Cannot modify header information' );

		ob_start();
		export_wp();
		$original_wp_export_output = ob_get_clean();

		$clean_wp_export_output = $this->remove_non_require_content( $original_wp_export_output );

		// Act.
		$elementor_export_output = ( new WP_Exporter() )->run();
		$clean_elementor_export_output = $this->remove_non_require_content( $elementor_export_output );

		// Assert.
		$this->assertEquals( $clean_wp_export_output, $clean_elementor_export_output );
	}

	// TODO: To be sure it have the same data in all cases, its require to insert the data for all the cases.
	//public function test__run__ensure_all_content_cases() {
	//
	//}
}
