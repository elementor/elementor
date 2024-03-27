<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Assets;

use Elementor\Core\Files\Uploads_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Svg_Handler extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$_REQUEST['uploadTypeCaller'] = 'elementor-media-upload';
	}

	/**
	 * Assert that the uploader accepts SVG.
	 */
	public function test_support_unfiltered_files_upload__accepts_svg() {
		// Arrange.
		$this->act_as_admin();
		update_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY, '1' );

		$key = 'svg';
		$value = 'image/svg+xml';

		// Act.
		$mimes = apply_filters( 'upload_mimes', wp_get_mime_types() );

		// Assert.
		$this->assertArrayHasKey( $key, $mimes );
		$this->assertEquals( $mimes[ $key ], $value );
	}

	/**
	 * Assert that the uploader doesn't accept SVG.
	 */
	public function test_support_unfiltered_files_upload__doesnt_accept_svg() {
		// Arrange.
		update_option( Uploads_Manager::UNFILTERED_FILE_UPLOADS_KEY, '0' );

		// Act.
		$mimes = apply_filters( 'upload_mimes', [] );

		// Assert.
		$this->assertEmpty( $mimes );
	}
}
