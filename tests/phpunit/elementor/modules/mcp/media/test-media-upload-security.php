<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Request_Media_Upload_Ability;
use Elementor\Modules\Mcp\Abilities\Update_Media_Attachment_Ability;
use Elementor\Modules\Mcp\Abilities\Upload_Media_Ability;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Media_Mime_Validator;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;
use Elementor\Modules\Mcp\Media\Pinned_Remote_Fetch;
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

	/**
	 * @param callable(string,string,string):(?array{response:array,headers:array,body:string}) $resolver
	 */
	private function mock_pinned_http_response( callable $resolver ): void {
		add_filter(
			'elementor/mcp/media/pinned_fetch_http_response',
			static function ( $response, $url, $host, $pinned_ip ) use ( $resolver ) {
				return $resolver( $url, $host, $pinned_ip );
			},
			10,
			4
		);
	}

	private function clear_pinned_http_mocks(): void {
		remove_all_filters( 'elementor/mcp/media/pinned_fetch_http_response' );
	}

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Media_Upload_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_upload_abilities__are_exposed_as_mcp_tools() {
		// Arrange
		$upload = new Upload_Media_Ability();
		$request = new Request_Media_Upload_Ability();
		$update = new Update_Media_Attachment_Ability();
		$registry = \Elementor\Modules\Mcp\Module::build_core_registry();

		// Assert
		$this->assertTrue( $upload->is_exposed_via_proxy() );
		$this->assertTrue( $upload->is_exposed_on_server() );
		$this->assertTrue( $request->is_exposed_via_proxy() );
		$this->assertTrue( $request->is_exposed_on_server() );
		$this->assertTrue( $update->is_exposed_via_proxy() );
		$this->assertTrue( $update->is_exposed_on_server() );
		$this->assertNotNull( $registry->find_by_proxy_slug( 'upload-media' ) );
		$this->assertNotNull( $registry->find_by_proxy_slug( 'request-media-upload' ) );
		$this->assertNotNull( $registry->find_by_proxy_slug( 'update-media-attachment' ) );
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

		$this->mock_pinned_http_response( static function ( $url ) {
			if ( str_contains( $url, 'example.com' ) ) {
				return [
					'response' => [ 'code' => 302 ],
					'headers' => [ 'location' => 'https://127.0.0.1/private.png' ],
					'body' => '',
				];
			}

			return null;
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/image.png',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'private_host_blocked', $result->get_error_code() );
	}

	public function test_upload_media__rejects_response_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$oversized = str_repeat( 'x', Media_Upload_Config::max_upload_bytes() + 1 );

		$this->mock_pinned_http_response( static function () use ( $oversized ) {
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

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
	}

	public function test_upload_media__rejects_disallowed_mime() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		$this->mock_pinned_http_response( static function () {
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

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_mime', $result->get_error_code() );
	}

	public function test_upload_media__rejects_svg_for_non_admin_editor() {
		// Arrange
		$this->act_as_editor();
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';

		$this->mock_pinned_http_response( static function () use ( $svg ) {
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

		$this->clear_pinned_http_mocks();

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
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="1" height="1"/></svg>';
		$tmp = wp_tempnam( 'mcp-admin-svg.svg' );
		file_put_contents( $tmp, $svg );

		// Act
		$mime_error = Media_Mime_Validator::assert_allowed_mime( Media_Upload_Config::SVG_MIME_TYPE );
		$sanitized = \Elementor\Plugin::$instance->uploads_manager->get_file_type_handlers( 'svg' )->sanitize_svg( $tmp );

		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Assert
		$this->assertNull( $mime_error );
		$this->assertTrue( $sanitized );
		$this->assertStringNotContainsString( 'onload', (string) file_get_contents( $tmp ) );
		wp_delete_file( $tmp );
	}

	public function test_upload_media__rejects_svg_for_admin_when_unfiltered_uploads_disabled() {
		// Arrange
		$this->act_as_admin();
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_false' );
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';

		$this->mock_pinned_http_response( static function () use ( $svg ) {
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

		$this->clear_pinned_http_mocks();
		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_false' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'svg_not_allowed', $result->get_error_code() );
	}

	public function test_upload_token__rejects_svg_for_admin_when_unfiltered_uploads_disabled() {
		// Arrange
		$this->act_as_admin();
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_false' );
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'icon.svg' );
		$request->set_body( '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>' );

		// Act
		$response = rest_do_request( $request );

		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_false' );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'svg_not_allowed', $response->get_data()['code'] );
	}

	public function test_upload_media__rejects_content_length_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$limit = Media_Upload_Config::max_upload_bytes();

		$this->mock_pinned_http_response( static function () use ( $limit ) {
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

		$this->clear_pinned_http_mocks();

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
	}

	public function test_pinned_remote_fetch__builds_curl_resolve_entry() {
		// Act
		$entry = Pinned_Remote_Fetch::build_curl_resolve_entry( 'example.com', '93.184.216.34' );

		// Assert
		$this->assertSame( 'example.com:443:93.184.216.34', $entry );
	}

	public function test_pinned_remote_fetch__registers_http_api_curl_hook_during_get() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		add_filter(
			'elementor/mcp/media/pinned_fetch_http_response',
			static function () {
				return [
					'response' => [ 'code' => 200 ],
					'headers' => [],
					'body' => 'ok',
				];
			},
			10,
			4
		);

		// Act
		$result = Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );

		remove_all_filters( 'elementor/mcp/media/pinned_fetch_http_response' );

		// Assert
		$this->assertNotWPError( $result );
		$this->assertSame( 200, wp_remote_retrieve_response_code( $result ) );
	}

	public function test_pinned_remote_fetch__rejects_when_curl_resolve_hook_does_not_run() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		add_filter(
			'pre_http_request',
			static function () {
				return [
					'response' => [ 'code' => 200 ],
					'headers' => [],
					'body' => 'ok',
				];
			},
			10,
			3
		);

		// Act
		$result = Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'remote_fetch_unpinned', $result->get_error_code() );
	}

	public function test_pinned_remote_fetch__removes_transport_filter_after_exception() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		add_filter(
			'pre_http_request',
			static function () {
				throw new \Exception( 'Pinned fetch test exception.' );
			},
			10,
			3
		);

		// Act
		try {
			Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );
		} catch ( \Exception $exception ) {
			$this->assertSame( 'Pinned fetch test exception.', $exception->getMessage() );
		}

		remove_all_filters( 'pre_http_request' );

		$transports = apply_filters( 'http_api_transports', [ 'curl', 'streams' ], [], 'https://example.com/' );

		// Assert
		$this->assertContains( 'streams', $transports );
	}

	/**
	 * @dataProvider denied_ip_address_provider
	 */
	public function test_assert_public_ip__rejects_denied_ranges( string $ip ) {
		// Act
		$error = Public_Host_Validator::assert_public_ip( $ip );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'private_host_blocked', $error->get_error_code() );
	}

	public function denied_ip_address_provider(): array {
		return [
			'0.0.0.0/8' => [ '0.0.0.1' ],
			'100.64.0.0/10' => [ '100.64.0.1' ],
			'169.254.0.0/16' => [ '169.254.169.254' ],
			'fe80::/10' => [ 'fe80::1' ],
			'fc00::/7' => [ 'fc00::1' ],
			'fd00::/7' => [ 'fd12::1' ],
			'64:ff9b::/96' => [ '64:ff9b::1' ],
			'ipv4-mapped' => [ '::ffff:169.254.169.254' ],
			'ipv4-mapped-loopback' => [ '::ffff:127.0.0.1' ],
			'ipv4-mapped-private' => [ '::ffff:10.0.0.1' ],
			'6to4' => [ '2002:7f00:1::1' ],
			'teredo' => [ '2001:0:4136:e378:8000:63bf:3fff:fdd2' ],
		];
	}

	public function test_assert_public_ip__allows_public_2001_4860_address() {
		// Act
		$error = Public_Host_Validator::assert_public_ip( '2001:4860:4860::8888' );

		// Assert
		$this->assertNull( $error );
	}

	public function test_select_pinned_ip__allows_dual_stack_host_with_public_2001_address() {
		// Arrange
		add_filter(
			'elementor/mcp/media/test_resolved_host_ips',
			static function ( $ips, $host ) {
				if ( 'dual-stack.example' === $host ) {
					return [ '93.184.216.34', '2001:4860:4860::8888' ];
				}

				return $ips;
			},
			10,
			2
		);

		// Act
		$pinned = Pinned_Remote_Fetch::select_pinned_ip( 'dual-stack.example' );

		remove_all_filters( 'elementor/mcp/media/test_resolved_host_ips' );

		// Assert
		$this->assertSame( '93.184.216.34', $pinned );
	}

	public function test_assert_https_url__rejects_non_443_port() {
		// Act
		$error = Public_Host_Validator::assert_https_url( 'https://example.com:8443/photo.png' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'invalid_url_port', $error->get_error_code() );
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

	public function test_upload_media__dedupe_does_not_update_another_users_attachment_meta() {
		// Arrange
		$this->act_as_admin();
		$source_url = 'https://example.com/dedupe-owner.png';
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
			'post_title' => 'Original title',
		] );
		update_post_meta( $attachment_id, Media_Upload_Config::SOURCE_URL_META_KEY, $source_url );

		$this->act_as_editor();

		$png = self::MINIMAL_PNG;

		$this->mock_pinned_http_response( static function () use ( $png ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => $source_url,
			'consent' => true,
			'title' => 'Editor title',
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'Original title', get_post( $attachment_id )->post_title );
		$this->assertNotSame( $attachment_id, $result['attachment_id'] );
	}

	public function test_token_consume__second_consume_fails() {
		// Arrange
		$this->act_as_admin();
		$issued = Media_Upload_Token_Store::issue_for_user( get_current_user_id() );

		// Act
		$first = Media_Upload_Token_Store::consume( $issued['token'] );
		$second = Media_Upload_Token_Store::consume( $issued['token'] );

		// Assert
		$this->assertIsArray( $first );
		$this->assertWPError( $second );
		$this->assertSame( 'invalid_upload_token', $second->get_error_code() );
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

	/**
	 * @dataProvider non_dns_host_provider
	 */
	public function test_assert_host_resolves_publicly__rejects_non_dns_hosts( string $host ) {
		// Act
		$error = Public_Host_Validator::assert_host_resolves_publicly( $host );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'invalid_url', $error->get_error_code() );
	}

	public function non_dns_host_provider(): array {
		return [
			'hex loopback' => [ '0x7f000001' ],
			'hex link-local' => [ '0xa9fea9fe' ],
			'short form' => [ '127.1' ],
			'decimal' => [ '2130706433' ],
			'octal' => [ '0177.0.0.1' ],
			'trailing dot ip' => [ '127.0.0.1.' ],
			'hex label' => [ '0x7f.0.0.1' ],
			'underscore' => [ 'bad_host.example' ],
		];
	}

	public function test_is_strict_dns_name__allows_regular_hostnames() {
		// Assert
		$this->assertTrue( Public_Host_Validator::is_strict_dns_name( 'example.com' ) );
		$this->assertTrue( Public_Host_Validator::is_strict_dns_name( 'cdn-1.images.example.co.uk' ) );
		$this->assertTrue( Public_Host_Validator::is_strict_dns_name( 'example.com.' ) );
	}

	public function test_upload_media__rejects_hex_form_host() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://0x7f000001/image.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_url', $result->get_error_code() );
	}

	public function test_pinned_remote_fetch__rejects_non_dns_host_in_resolve_entry() {
		// Act
		$entry = Pinned_Remote_Fetch::build_curl_resolve_entry( '0x7f000001', '198.18.0.1' );

		// Assert
		$this->assertWPError( $entry );
		$this->assertSame( 'invalid_url', $entry->get_error_code() );
	}

	public function test_pinned_remote_fetch__rejects_encoded_response() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$this->mock_pinned_http_response( static function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-encoding' => 'gzip' ],
				'body' => 'ok',
			];
		} );

		// Act
		$result = Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'unsupported_content_encoding', $result->get_error_code() );
	}

	public function test_pinned_remote_fetch__allows_identity_content_encoding() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$this->mock_pinned_http_response( static function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-encoding' => 'identity' ],
				'body' => 'ok',
			];
		} );

		// Act
		$result = Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertNotWPError( $result );
		$this->assertSame( 200, wp_remote_retrieve_response_code( $result ) );
	}

	public function test_upload_token__restores_no_user_after_successful_upload() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel.png' );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $response->get_status() );
		$this->assertSame( 0, get_current_user_id() );
	}

	public function test_upload_token__restores_no_user_after_failed_upload() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$issued = $ability->execute( [ 'consent' => true ] );
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_SHA256_HEADER, str_repeat( '0', 64 ) );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'sha256_mismatch', $response->get_data()['code'] );
		$this->assertSame( 0, get_current_user_id() );
	}
}
