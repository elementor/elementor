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

	public function test_pinned_remote_fetch__removes_curl_hook_after_exception() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$hooks_before = has_action( 'http_api_curl' );

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

		// Assert
		$this->assertSame( $hooks_before, has_action( 'http_api_curl' ) );
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
			'192.0.0.0/24' => [ '192.0.0.192' ],
			'192.0.2.0/24' => [ '192.0.2.1' ],
			'192.88.99.0/24' => [ '192.88.99.1' ],
			'198.18.0.0/15' => [ '198.19.255.254' ],
			'198.51.100.0/24' => [ '198.51.100.1' ],
			'203.0.113.0/24' => [ '203.0.113.1' ],
			'224.0.0.0/4' => [ '224.0.0.1' ],
			'240.0.0.0/4' => [ '240.0.0.1' ],
			'broadcast' => [ '255.255.255.255' ],
			'cloud metadata wireserver' => [ '168.63.129.16' ],
			'loopback' => [ '127.0.0.1' ],
			'10.0.0.0/8' => [ '10.0.0.1' ],
			'172.16.0.0/12' => [ '172.16.0.1' ],
			'192.168.0.0/16' => [ '192.168.0.1' ],
			'fec0::/10' => [ 'fec0::1' ],
			'ff00::/8' => [ 'ff02::1' ],
			'100::/64' => [ '100::1' ],
			'2001:db8::/32' => [ '2001:db8::1' ],
			'ipv4-compatible loopback' => [ '::7f00:1' ],
			'ipv4-translated loopback' => [ '::ffff:0:7f00:1' ],
			'ipv6 loopback' => [ '::1' ],
			'ipv6 unspecified' => [ '::' ],
			'2001:2::/48' => [ '2001:2::1' ],
			'2001:10::/28' => [ '2001:1f:ffff::1' ],
			'2001:20::/28' => [ '2001:2f::1' ],
			'3fff::/20' => [ '3fff:fff::1' ],
			'5f00::/16' => [ '5f00::1' ],
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

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

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
			'trailing newline' => [ "example.com\n" ],
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

	public function test_request_media_upload__issues_one_token_when_count_omitted() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertCount( 1, $result['uploads'] );
		$this->assertSame( $result['upload_token'], $result['uploads'][0]['upload_token'] );
	}

	public function test_request_media_upload__issues_distinct_tokens_for_count() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [
			'consent' => true,
			'count' => 3,
		] );

		// Assert
		$tokens = array_column( $result['uploads'], 'upload_token' );

		$this->assertCount( 3, $result['uploads'] );
		$this->assertCount( 3, array_unique( $tokens ) );
		$this->assertSame( $tokens[0], $result['upload_token'] );
		$this->assertSame( $result['uploads'][0]['curl_command'], $result['curl_command'] );
		$this->assertSame( $result['uploads'][0]['expires_at_unix'], $result['expires_at_unix'] );
		$this->assertSame( $result['uploads'][0]['upload_url'], $result['upload_url'] );

		foreach ( $tokens as $token ) {
			$this->assertTrue( Media_Upload_Token_Store::is_valid_for_request( $token ) );
		}
	}

	public function test_request_media_upload__rejects_count_above_max() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [
			'consent' => true,
			'count' => Media_Upload_Config::MAX_UPLOADS_PER_REQUEST + 1,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_upload_count', $result->get_error_code() );
	}

	/**
	 * @dataProvider invalid_upload_count_provider
	 */
	public function test_request_media_upload__rejects_invalid_count( $count ) {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [
			'consent' => true,
			'count' => $count,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_upload_count', $result->get_error_code() );
	}

	public function invalid_upload_count_provider(): array {
		return [
			'zero' => [ 0 ],
			'negative' => [ -1 ],
			'float' => [ 1.5 ],
			'string' => [ 'two' ],
			'numeric string' => [ '2' ],
			'boolean' => [ true ],
		];
	}

	public function test_request_media_upload__each_token_is_single_use() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$result = $ability->execute( [
			'consent' => true,
			'count' => 2,
		] );

		$responses = [];

		// Act
		foreach ( $result['uploads'] as $index => $upload ) {
			$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
			$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $upload['upload_token'] );
			$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel-' . $index . '.png' );
			$request->set_body( self::MINIMAL_PNG );

			$responses[] = rest_do_request( $request );
		}

		$reuse = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$reuse->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $result['uploads'][0]['upload_token'] );
		$reuse->set_body( self::MINIMAL_PNG );
		$reused = rest_do_request( $reuse );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $responses[0]->get_status() );
		$this->assertSame( \WP_Http::CREATED, $responses[1]->get_status() );
		$this->assertSame( \WP_Http::FORBIDDEN, $reused->get_status() );
	}

	public function test_assert_public_ip__allows_public_addresses_next_to_denied_ranges() {
		// Assert
		$this->assertNull( Public_Host_Validator::assert_public_ip( '198.20.0.1' ) );
		$this->assertNull( Public_Host_Validator::assert_public_ip( '93.184.216.34' ) );
		$this->assertNull( Public_Host_Validator::assert_public_ip( '2606:4700:4700::1111' ) );
		$this->assertNull( Public_Host_Validator::assert_public_ip( '2001:30::1' ) );
		$this->assertNull( Public_Host_Validator::assert_public_ip( '3fff:1000::1' ) );
		$this->assertNull( Public_Host_Validator::assert_public_ip( '5f01::1' ) );
	}

	public function test_assert_https_url__rejects_userinfo() {
		// Act
		$error = Public_Host_Validator::assert_https_url( 'https://user@example.com/photo.png' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'invalid_url', $error->get_error_code() );
	}

	public function test_upload_media__rejects_ipv6_literal_host() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://[2001:4860:4860::8888]/image.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
	}

	public function test_upload_media__follows_relative_redirect() {
		// Arrange
		$this->act_as_admin();
		$png = self::MINIMAL_PNG;

		$this->mock_pinned_http_response( static function ( $url ) use ( $png ) {
			if ( str_ends_with( $url, '/start.png' ) ) {
				return [
					'response' => [ 'code' => 302 ],
					'headers' => [ 'location' => '/final.png' ],
					'body' => '',
				];
			}

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/start.png',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'image/png', $result['mime'] );
	}

	public function test_upload_media__rejects_redirect_without_location() {
		// Arrange
		$this->act_as_admin();

		$this->mock_pinned_http_response( static function () {
			return [
				'response' => [ 'code' => 302 ],
				'headers' => [],
				'body' => '',
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/start.png',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_redirect', $result->get_error_code() );
	}

	public function test_upload_media__rejects_too_many_redirects() {
		// Arrange
		$this->act_as_admin();

		$this->mock_pinned_http_response( static function () {
			return [
				'response' => [ 'code' => 302 ],
				'headers' => [ 'location' => 'https://example.com/loop.png' ],
				'body' => '',
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://example.com/loop.png',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'too_many_redirects', $result->get_error_code() );
	}

	public function test_upload_media__does_not_store_query_string_in_source_url_meta() {
		// Arrange
		$this->act_as_admin();
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
		$with_query = $ability->execute( [
			'source_url' => 'https://example.com/signed.png?sig=abc123',
			'consent' => true,
		] );
		$with_fragment = $ability->execute( [
			'source_url' => 'https://example.com/plain.png#section',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertSame( '', (string) get_post_meta( $with_query['attachment_id'], Media_Upload_Config::SOURCE_URL_META_KEY, true ) );
		$this->assertSame(
			'https://example.com/plain.png',
			get_post_meta( $with_fragment['attachment_id'], Media_Upload_Config::SOURCE_URL_META_KEY, true )
		);
	}

	public function test_upload_media__returns_error_when_dedupe_update_is_denied() {
		// Arrange
		$this->act_as_admin();
		$source_url = 'https://example.com/dedupe-denied.png';
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );
		update_post_meta( $attachment_id, Media_Upload_Config::SOURCE_URL_META_KEY, $source_url );

		$deny_edit = static function ( $caps, $cap, $user_id, $args ) use ( $attachment_id ) {
			if ( 'edit_post' === $cap && isset( $args[0] ) && (int) $args[0] === $attachment_id ) {
				return [ 'do_not_allow' ];
			}

			return $caps;
		};

		add_filter( 'map_meta_cap', $deny_edit, 10, 4 );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => $source_url,
			'consent' => true,
			'title' => 'New title',
		] );

		remove_filter( 'map_meta_cap', $deny_edit, 10 );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
	}

	public function test_create_from_temp_file__deletes_temp_file_without_upload_capability() {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		$tmp = wp_tempnam( 'mcp-cap-check.png' );
		file_put_contents( $tmp, self::MINIMAL_PNG );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'pixel.png',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertFalse( file_exists( $tmp ) );
	}

	public function test_update_title_and_alt__returns_not_found_for_missing_attachment() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = Media_Attachment_Service::update_title_and_alt( 99999999, 'Title', null );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_attachment', $result->get_error_code() );
	}

	public function test_update_title_and_alt__limits_length() {
		// Arrange
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );

		// Act
		$result = Media_Attachment_Service::update_title_and_alt(
			$attachment_id,
			str_repeat( 't', 1000 ),
			str_repeat( 'a', 1000 )
		);

		// Assert
		$this->assertSame( Media_Upload_Config::MAX_METADATA_LENGTH, strlen( $result['alt'] ) );
		$this->assertSame( Media_Upload_Config::MAX_METADATA_LENGTH, strlen( get_post( $attachment_id )->post_title ) );
	}

	public function test_update_media_attachment__rejects_empty_title_and_non_integer_id() {
		// Arrange
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );
		$ability = new Update_Media_Attachment_Ability();

		// Act
		$empty_title = $ability->execute( [
			'attachment_id' => $attachment_id,
			'title' => '  ',
		] );
		$string_id = $ability->execute( [
			'attachment_id' => $attachment_id . 'abc',
			'title' => 'Title',
		] );

		// Assert
		$this->assertWPError( $empty_title );
		$this->assertSame( 'invalid_title', $empty_title->get_error_code() );
		$this->assertWPError( $string_id );
		$this->assertSame( 'invalid_attachment', $string_id->get_error_code() );
	}

	public function test_max_upload_bytes__filter_cannot_raise_the_limit() {
		// Arrange
		$default = Media_Upload_Config::max_upload_bytes();
		add_filter( 'elementor/mcp/media/max_upload_bytes', static fn() => PHP_INT_MAX );

		// Act
		$raised = Media_Upload_Config::max_upload_bytes();

		remove_all_filters( 'elementor/mcp/media/max_upload_bytes' );
		add_filter( 'elementor/mcp/media/max_upload_bytes', static fn() => 1024 );

		$lowered = Media_Upload_Config::max_upload_bytes();

		remove_all_filters( 'elementor/mcp/media/max_upload_bytes' );

		// Assert
		$this->assertSame( $default, $raised );
		$this->assertSame( 1024, $lowered );
	}

	public function test_sniff_mime_type__detects_svg_with_prolog_and_comment() {
		// Arrange
		$tmp = wp_tempnam( 'mcp-sniff.svg' );
		file_put_contents( $tmp, "\xEF\xBB\xBF<?xml version=\"1.0\"?>\n<!-- exported -->\n<svg xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"1\" height=\"1\"/></svg>" );

		$text = wp_tempnam( 'mcp-sniff.txt' );
		file_put_contents( $text, 'plain text <svg not at start' );

		// Act
		$svg_mime = Media_Mime_Validator::sniff_mime_type( $tmp );
		$text_mime = Media_Mime_Validator::sniff_mime_type( $text );

		wp_delete_file( $tmp );
		wp_delete_file( $text );

		// Assert
		$this->assertSame( Media_Upload_Config::SVG_MIME_TYPE, $svg_mime );
		$this->assertNotSame( Media_Upload_Config::SVG_MIME_TYPE, $text_mime );
	}

	public function test_svg_upload__succeeds_for_admin_when_unfiltered_uploads_enabled() {
		// Arrange
		if ( ! \Elementor\Core\Files\File_Types\Svg::file_sanitizer_can_run() ) {
			$this->markTestSkipped( 'SVG sanitizer is not available in this environment.' );
		}

		$this->act_as_admin();
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );
		$provide_dimensions = static function ( $metadata ) {
			$metadata['width'] = 1;
			$metadata['height'] = 1;

			return $metadata;
		};
		add_filter( 'wp_generate_attachment_metadata', $provide_dimensions );
		$tmp = wp_tempnam( 'mcp-admin-upload.svg' );
		file_put_contents( $tmp, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" onload="alert(1)"><rect width="1" height="1"/></svg>' );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'icon.svg',
		] );

		remove_filter( 'wp_generate_attachment_metadata', $provide_dimensions );
		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( Media_Upload_Config::SVG_MIME_TYPE, $result['mime'] );
		$this->assertStringNotContainsString( 'onload', (string) file_get_contents( get_attached_file( $result['attachment_id'] ) ) );
	}

	public function test_svg_upload__is_evaluated_for_the_given_user() {
		// Arrange
		$this->act_as_editor();
		$admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );
		$current_user_id = get_current_user_id();

		// Act
		$allowed_for_admin = Media_Upload_Config::is_svg_upload_allowed_for_user( $admin_id );
		$allowed_for_editor = Media_Upload_Config::is_svg_upload_allowed_for_user( $current_user_id );

		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Assert
		$this->assertSame( $current_user_id, get_current_user_id() );
		$this->assertFalse( $allowed_for_editor );
		$this->assertSame( \Elementor\Core\Files\File_Types\Svg::file_sanitizer_can_run(), $allowed_for_admin );
	}

	public function test_upload_token__rejects_user_who_lost_upload_capability() {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $user_id );
		$issued = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );
		( new \WP_User( $user_id ) )->set_role( 'subscriber' );
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 0, get_current_user_id() );
	}

	public function test_request_media_upload__accepts_count_bounds() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$single = $ability->execute( [
			'consent' => true,
			'count' => 1,
		] );
		$max = $ability->execute( [
			'consent' => true,
			'count' => Media_Upload_Config::MAX_UPLOADS_PER_REQUEST,
		] );
		$null_count = $ability->execute( [
			'consent' => true,
			'count' => null,
		] );
		$huge = $ability->execute( [
			'consent' => true,
			'count' => PHP_INT_MAX,
		] );

		// Assert
		$this->assertCount( 1, $single['uploads'] );
		$this->assertCount( Media_Upload_Config::MAX_UPLOADS_PER_REQUEST, $max['uploads'] );
		$this->assertCount( 1, $null_count['uploads'] );
		$this->assertWPError( $huge );
		$this->assertSame( 'invalid_upload_count', $huge->get_error_code() );
	}

	public function test_request_media_upload__limits_outstanding_tokens_per_user() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();
		$user_id = get_current_user_id();

		for ( $index = 0; $index < Media_Upload_Config::MAX_OUTSTANDING_TOKENS_PER_USER; $index++ ) {
			Media_Upload_Token_Store::issue_for_user( $user_id );
		}

		// Act
		$result = $ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'too_many_pending_uploads', $result->get_error_code() );
	}

	public function test_request_media_upload__used_tokens_free_up_capacity() {
		// Arrange
		$this->act_as_admin();
		$user_id = get_current_user_id();
		$issued = Media_Upload_Token_Store::issue_for_user( $user_id );
		$this->assertSame( 1, Media_Upload_Token_Store::outstanding_count( $user_id ) );

		// Act
		Media_Upload_Token_Store::consume( $issued['token'] );

		// Assert
		$this->assertSame( 0, Media_Upload_Token_Store::outstanding_count( $user_id ) );
	}

	public function test_request_media_upload__curl_command_sends_raw_body_content_type() {
		// Arrange
		$this->act_as_admin();
		$ability = new Request_Media_Upload_Ability();

		// Act
		$result = $ability->execute( [ 'consent' => true ] );

		// Assert
		$this->assertStringContainsString( "-H 'Content-Type: application/octet-stream'", $result['curl_command'] );
	}

	public function test_upload_token__limits_title_and_alt_header_length() {
		// Arrange
		$this->act_as_admin();
		$issued = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel.png' );
		$request->set_header( Media_Upload_Config::UPLOAD_TITLE_HEADER, str_repeat( 't', 1000 ) );
		$request->set_header( Media_Upload_Config::UPLOAD_ALT_HEADER, str_repeat( 'a', 1000 ) );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $response->get_status() );
		$this->assertSame( Media_Upload_Config::MAX_METADATA_LENGTH, strlen( $response->get_data()['alt'] ) );
	}

	/**
	 * @dataProvider roles_without_upload_capability_provider
	 */
	public function test_media_abilities__deny_users_without_upload_capability( string $role ) {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => $role ] );
		wp_set_current_user( $user_id );
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => $user_id,
			'post_mime_type' => 'image/jpeg',
		] );

		// Act
		$upload = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://example.com/photo.png',
			'consent' => true,
		] );
		$request = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );
		$update = ( new Update_Media_Attachment_Ability() )->execute( [
			'attachment_id' => $attachment_id,
			'title' => 'New title',
		] );
		$permission = [
			( new Upload_Media_Ability() )->check_permission(),
			( new Request_Media_Upload_Ability() )->check_permission(),
			( new Update_Media_Attachment_Ability() )->check_permission(),
		];

		// Assert
		foreach ( [ $upload, $request, $update ] as $result ) {
			$this->assertWPError( $result );
			$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		}

		$this->assertSame( [ false, false, false ], $permission );
	}

	public function roles_without_upload_capability_provider(): array {
		return [
			'contributor' => [ 'contributor' ],
			'subscriber' => [ 'subscriber' ],
		];
	}

	/**
	 * @dataProvider roles_with_upload_capability_provider
	 */
	public function test_media_flow__works_for_non_administrators( string $role ) {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => $role ] );
		wp_set_current_user( $user_id );

		// Act
		$issued = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'pixel.png' );
		$request->set_body( self::MINIMAL_PNG );
		$response = rest_do_request( $request );

		wp_set_current_user( $user_id );
		$attachment_id = $response->get_data()['attachment_id'] ?? 0;
		$updated = ( new Update_Media_Attachment_Ability() )->execute( [
			'attachment_id' => $attachment_id,
			'title' => 'Updated title',
			'alt' => 'Updated alt',
		] );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $response->get_status() );
		$this->assertSame( 'image/png', $response->get_data()['mime'] );
		$this->assertSame( $user_id, (int) get_post( $attachment_id )->post_author );
		$this->assertIsArray( $updated );
		$this->assertSame( 'Updated alt', $updated['alt'] );
		$this->assertSame( 'Updated title', get_post( $attachment_id )->post_title );
	}

	/**
	 * @dataProvider roles_with_upload_capability_provider
	 */
	public function test_upload_media__works_for_non_administrators( string $role ) {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => $role ] ) );
		$png = self::MINIMAL_PNG;

		$this->mock_pinned_http_response( static function () use ( $png ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://example.com/' . $role . '.png',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'image/png', $result['mime'] );
	}

	public function roles_with_upload_capability_provider(): array {
		return [
			'editor' => [ 'editor' ],
			'author' => [ 'author' ],
		];
	}

	/**
	 * @dataProvider roles_with_upload_capability_provider
	 */
	public function test_svg_upload__is_rejected_for_non_administrators( string $role ) {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => $role ] ) );
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );
		$tmp = wp_tempnam( 'mcp-non-admin.svg' );
		file_put_contents( $tmp, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>' );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'icon.svg',
		] );

		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'svg_not_allowed', $result->get_error_code() );
		$this->assertFalse( file_exists( $tmp ) );
	}

	public function test_upload_media__rejects_svg_for_editor_from_remote_url() {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'editor' ] ) );
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';

		$this->mock_pinned_http_response( static function () use ( $svg ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $svg,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://example.com/icon.svg',
			'consent' => true,
		] );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'svg_not_allowed', $result->get_error_code() );
	}

	public function test_create_from_temp_file__denies_subscriber_and_deletes_temp_file() {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$tmp = wp_tempnam( 'mcp-editor-check.png' );
		file_put_contents( $tmp, self::MINIMAL_PNG );

		// Act
		$result = Media_Attachment_Service::create_from_temp_file( [
			'tmp_name' => $tmp,
			'name' => 'pixel.png',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertFalse( file_exists( $tmp ) );
	}

	public function test_upload_token__issued_for_user_without_upload_capability_is_not_redeemable() {
		// Arrange
		$editor_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		$issued = Media_Upload_Token_Store::issue_for_user( $editor_id );
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['token'] );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 0, get_current_user_id() );
	}

	public function test_list_assets_hint__omits_upload_tools_for_users_without_upload_capability() {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'contributor' ] ) );
		$ability = new \Elementor\Modules\Mcp\Abilities\List_Assets_Ability();

		// Act
		$result = $ability->execute( [ 'search' => 'nonexistent-needle-' . wp_generate_password( 12, false ) ] );

		// Assert
		$this->assertSame(
			\Elementor\Modules\Mcp\Abilities\List_Assets_Ability::EMPTY_RESULT_HINT_WITHOUT_UPLOAD_TOOLS,
			$result['llm_instructions']
		);
	}

	public function test_update_media_attachment__accepts_numeric_string_id() {
		// Arrange
		$this->act_as_admin();
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
		] );
		$ability = new Update_Media_Attachment_Ability();

		// Act
		$from_string = $ability->execute( [
			'attachment_id' => (string) $attachment_id,
			'alt' => 'Alt from string id',
		] );
		$from_float = $ability->execute( [
			'attachment_id' => (float) $attachment_id,
			'alt' => 'Alt from float id',
		] );
		$from_signed = $ability->execute( [
			'attachment_id' => '-' . $attachment_id,
			'alt' => 'Alt from signed id',
		] );

		// Assert
		$this->assertSame( 'Alt from string id', $from_string['alt'] );
		$this->assertWPError( $from_float );
		$this->assertSame( 'invalid_attachment', $from_float->get_error_code() );
		$this->assertWPError( $from_signed );
		$this->assertSame( 'invalid_attachment', $from_signed->get_error_code() );
	}

	public function test_pinned_remote_fetch__registers_direct_connection_hook_at_last_priority() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$priorities = [];

		add_filter(
			'pre_http_request',
			static function () use ( &$priorities ) {
				global $wp_filter;

				$priorities = isset( $wp_filter['http_api_curl'] ) ? array_keys( $wp_filter['http_api_curl']->callbacks ) : [];

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
		Pinned_Remote_Fetch::get( 'https://example.com/photo.png', 'example.com', '93.184.216.34' );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertContains( PHP_INT_MAX, $priorities );
		$remaining = isset( $GLOBALS['wp_filter']['http_api_curl'] ) ? array_keys( $GLOBALS['wp_filter']['http_api_curl']->callbacks ) : [];
		$this->assertNotContains( PHP_INT_MAX, $remaining );
	}

	public function test_pinned_remote_fetch__direct_connection_options_accept_curl_handle() {
		// Arrange
		if ( ! Pinned_Remote_Fetch::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$handle = curl_init();

		// Act
		Pinned_Remote_Fetch::apply_direct_connection_options( $handle );
		Pinned_Remote_Fetch::apply_direct_connection_options( null );

		// Assert
		$this->assertTrue( true );
	}
}
