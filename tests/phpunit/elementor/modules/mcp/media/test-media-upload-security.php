<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Request_Media_Upload_Ability;
use Elementor\Modules\Mcp\Abilities\Upload_Media_Ability;
use Elementor\Modules\Mcp\Media\Media_Mime_Validator;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;
use Elementor\Modules\Mcp\Media\Public_Host_Validator;
use Elementor\Modules\Mcp\RestApi\Mcp_Media_Upload_REST_API;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Media_Upload_Security extends Elementor_Test_Base {

	private const MINIMAL_PNG = "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82";

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Media_Upload_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_public_host_validator__rejects_loopback_ip() {
		// Arrange
		$error = Public_Host_Validator::assert_public_ip( '127.0.0.1' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'private_host_blocked', $error->get_error_code() );
	}

	public function test_upload_media__rejects_non_https_scheme() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'http://example.com/image.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_url_scheme', $result->get_error_code() );
	}

	public function test_upload_media__rejects_private_ip_literal_in_url() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://127.0.0.1/image.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'private_host_blocked', $result->get_error_code() );
	}

	public function test_upload_media__rejects_redirect_to_private_host() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		add_filter( 'pre_http_request', function ( $response, $args, $url ) {
			if ( str_contains( $url, 'example.com' ) ) {
				return [
					'response' => [ 'code' => 302 ],
					'headers' => [ 'location' => 'https://127.0.0.1/private.png' ],
					'body' => '',
				];
			}

			return $response;
		}, 10, 3 );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/image.png',
			'consent' => true,
		] );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'private_host_blocked', $result->get_error_code() );
	}

	public function test_upload_media__rejects_response_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$oversized = str_repeat( 'x', Media_Upload_Config::max_upload_bytes() + 1 );

		add_filter( 'pre_http_request', function () use ( $oversized ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $oversized,
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/photo.png',
			'consent' => true,
		] );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
	}

	public function test_upload_media__rejects_disallowed_mime() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		add_filter( 'pre_http_request', function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => 'not-an-image',
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/file.bin',
			'consent' => true,
		] );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_mime', $result->get_error_code() );
	}

	public function test_upload_media__rejects_svg_for_non_admin_editor() {
		// Arrange
		$this->act_as_editor();
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';

		add_filter( 'pre_http_request', function () use ( $svg ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $svg,
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/icon.svg',
			'consent' => true,
		] );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'svg_not_allowed', $result->get_error_code() );
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

	public function test_upload_media__rejects_content_length_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$limit = Media_Upload_Config::max_upload_bytes();

		add_filter( 'pre_http_request', function () use ( $limit ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-length' => (string) ( $limit + 1 ) ],
				'body' => 'small-body',
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/photo.png',
			'consent' => true,
		] );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
	}

	public function test_upload_token__rejects_oversized_body() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		$oversized = str_repeat( 'x', Media_Upload_Config::max_upload_bytes() + 1 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_body( $oversized );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'file_too_large', $response->get_data()['code'] );
	}

	public function test_upload_token__rejects_content_length_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		$limit = Media_Upload_Config::max_upload_bytes();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( 'Content-Length', (string) ( $limit + 1 ) );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'file_too_large', $response->get_data()['code'] );
	}

	public function test_upload_media__requires_upload_files_capability() {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/photo.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	public function test_upload_token__expires() {
		// Arrange
		$this->act_as_admin();
		$issued = Media_Upload_Token_Store::issue_for_user( get_current_user_id() );
		$key = Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . hash( 'sha256', $issued['token'] );
		set_transient( $key, [
			'user_id' => get_current_user_id(),
			'expires_at' => time() - 10,
		], 60 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['token'] );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'upload_token_expired', $response->get_data()['code'] );
	}

	public function test_upload_token__single_use() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		$token = $issued['upload_token'];

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $token );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel.png' );
		$request->set_body( self::MINIMAL_PNG );

		$first = rest_do_request( $request );
		$second = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $first->get_status() );
		$this->assertSame( \WP_Http::FORBIDDEN, $second->get_status() );
		$this->assertSame( 'invalid_upload_token', $second->get_data()['code'] );
	}

	public function test_upload_token__rejects_mismatched_logged_in_user() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		$token = $issued['upload_token'];

		$editor_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_id );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $token );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel.png' );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'upload_token_user_mismatch', $response->get_data()['code'] );
	}
}
