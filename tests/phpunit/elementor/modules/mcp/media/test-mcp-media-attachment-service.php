<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Media_Mime_Validator;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Media_Attachment_Service extends Elementor_Test_Base {

	private const MINIMAL_PNG = "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82";

	public function test_create_from_temp_file__rejects_disallowed_mime() {
		// Arrange
		$this->act_as_admin();
		$tmp = wp_tempnam( 'mcp-invalid.bin' );
		file_put_contents( $tmp, 'not-an-image' );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'invalid.bin',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_mime', $result->get_error_code() );
		wp_delete_file( $tmp );
	}

	public function test_create_from_temp_file__creates_png_attachment() {
		// Arrange
		$this->act_as_admin();
		$tmp = wp_tempnam( 'mcp-pixel.png' );
		file_put_contents( $tmp, self::MINIMAL_PNG );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'pixel.png',
		], 'Pixel title', 'Pixel alt' );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'Pixel title', get_post( $result['attachment_id'] )->post_title );
		$this->assertSame( 'Pixel alt', get_post_meta( $result['attachment_id'], '_wp_attachment_image_alt', true ) );
	}

	public function test_svg_upload_path__sanitizes_for_admin() {
		// Arrange
		if ( ! \Elementor\Core\Files\File_Types\Svg::file_sanitizer_can_run() ) {
			$this->markTestSkipped( 'SVG sanitizer is not available in this environment.' );
		}

		$this->act_as_admin();
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="1" height="1"/></svg>';
		$tmp = wp_tempnam( 'mcp-admin-svg.svg' );
		file_put_contents( $tmp, $svg );

		// Act
		$mime_error = Media_Mime_Validator::assert_allowed_mime( Media_Upload_Config::SVG_MIME_TYPE );
		$sanitized = ( new \Elementor\Core\Files\File_Types\Svg() )->sanitize_svg( $tmp );

		// Assert
		$this->assertNull( $mime_error );
		$this->assertTrue( $sanitized );
		$this->assertStringNotContainsString( 'onload', (string) file_get_contents( $tmp ) );
		wp_delete_file( $tmp );
	}

	public function test_update_title_and_alt__requires_edit_post_on_attachment() {
		// Arrange
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );

		$other_author = self::factory()->user->create( [ 'role' => 'author' ] );
		wp_set_current_user( $other_author );

		// Act
		$result = Media_Attachment_Service::update_title_and_alt( $attachment_id, 'New title', null );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}
}
