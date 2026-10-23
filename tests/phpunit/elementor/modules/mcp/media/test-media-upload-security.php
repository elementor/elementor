<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Abilities\Request_Media_Upload_Ability;
use Elementor\Modules\Mcp\Abilities\Upload_Media_Ability;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Media_Mime_Validator;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;
use Elementor\Modules\Mcp\Media\Remote_Image_Fetcher;
use Elementor\Modules\Mcp\RestApi\Mcp_Media_Upload_REST_API;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
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
	 * Supplies HTTP responses through the standard pre_http_request filter.
	 *
	 * @param callable(string):(array{response:array,headers:array,body:string}|\WP_Error|null) $resolver
	 */
	private function mock_http_response( callable $resolver ): void {
		add_filter(
			'pre_http_request',
			static function ( $preempt, $args, $url ) use ( $resolver ) {
				return $resolver( $url ) ?? $preempt;
			},
			10,
			3
		);
	}

	private function clear_http_mocks(): void {
		remove_all_filters( 'pre_http_request' );
	}

	public function setUp(): void {
		parent::setUp();

		$experiments = Plugin::$instance->experiments;
		if ( ! $experiments->get_features( Mcp_Media_Feature_Gate::EXPERIMENT_NAME ) ) {
			$experiments->add_feature( Mcp_Media_Feature_Gate::get_experimental_data() );
		}
		$experiments->set_feature_default_state( Mcp_Media_Feature_Gate::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Media_Upload_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_upload_abilities__are_exposed_as_mcp_tools() {
		// Arrange
		$upload = new Upload_Media_Ability();
		$request = new Request_Media_Upload_Ability();
		$registry = \Elementor\Modules\Mcp\Module::build_core_registry();

		// Assert
		$this->assertTrue( $upload->is_exposed_via_proxy() );
		$this->assertTrue( $upload->is_exposed_on_server() );
		$this->assertTrue( $request->is_exposed_via_proxy() );
		$this->assertTrue( $request->is_exposed_on_server() );
		$this->assertNotNull( $registry->find_by_proxy_slug( 'upload-media' ) );
		$this->assertNotNull( $registry->find_by_proxy_slug( 'request-media-upload' ) );
	}

	/**
	 * @dataProvider inline_file_input_provider
	 */
	public function test_proxy__rejects_inputs_outside_the_tool_schema( array $input ) {
		// Arrange
		$this->act_as_admin();
		$registry = new \Elementor\Modules\Mcp\Registry\Ability_Registry();
		$registry->add( new Upload_Media_Ability() );

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();
		( new \Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API( $registry ) )->register_hooks();
		do_action( 'rest_api_init' );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'upload-media',
			'input' => $input,
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'invalid_input', $response->get_data()['code'] );
	}

	public function inline_file_input_provider(): array {
		return [
			'base64 field' => [ [
				'consent' => true,
				'file_base64' => 'iVBORw0KGgo=',
			] ],
			'unknown key inside images' => [ [
				'consent' => true,
				'images' => [ [
					'source_url' => 'https://93.184.215.14/a.png',
					'data' => 'iVBORw0KGgo=',
				] ],
			] ],
			'missing consent' => [ [ 'source_url' => 'https://93.184.215.14/a.png' ] ],
		];
	}

	public function test_upload_route__is_registered_only_with_the_mcp_abilities() {
		// Arrange
		$source = file_get_contents( dirname( __DIR__, 6 ) . '/modules/mcp/module.php' );
		$constructor = substr( $source, strpos( $source, 'public function __construct()' ) );
		$constructor = substr( $constructor, 0, strpos( $constructor, "\n\t}\n" ) );

		// Assert
		$this->assertLessThan(
			strpos( $constructor, '( new Mcp_Media_Upload_REST_API() )->register_hooks();' ),
			strpos( $constructor, 'if ( ! self::is_active() ) {' )
		);
		$this->assertLessThan(
			strpos( $constructor, '( new Mcp_Media_Upload_REST_API() )->register_hooks();' ),
			strpos( $constructor, 'if ( self::is_site_mcp_exposure_enabled() ) {' )
		);
	}

	public function test_is_public_ip__rejects_loopback_ip() {
		// Assert
		$this->assertFalse( Remote_Image_Fetcher::is_public_ip( '127.0.0.1' ) );
	}

	public function test_upload_media__rejects_non_https_scheme() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'http://93.184.215.14/image.png',
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
		$this->assertSame( 'remote_host_not_allowed', $result->get_error_code() );
	}

	public function test_upload_media__rejects_redirect_to_private_host() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		$this->mock_http_response( static function ( $url ) {
			if ( str_contains( $url, '93.184.215.14' ) ) {
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
			'source_url' => 'https://93.184.215.14/image.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'remote_host_not_allowed', $result->get_error_code() );
	}

	public function test_upload_media__rejects_response_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$oversized = str_repeat( 'x', Media_Upload_Config::max_upload_bytes() + 1 );

		$this->mock_http_response( static function () use ( $oversized ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $oversized,
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/photo.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
	}

	public function test_upload_media__rejects_disallowed_mime() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();

		$this->mock_http_response( static function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => 'not-an-image',
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/file.bin',
			'consent' => true,
		] );

		$this->clear_http_mocks();

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

		$this->mock_http_response( static function () use ( $svg ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $svg,
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/icon.svg',
			'consent' => true,
		] );

		$this->clear_http_mocks();
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

	public function test_upload_media__rejects_download_larger_than_cap() {
		// Arrange
		$this->act_as_admin();
		$ability = new Upload_Media_Ability();
		$limit = Media_Upload_Config::max_upload_bytes();
		$oversized = str_repeat( 'x', $limit + 1 );

		$this->mock_http_response( static function () use ( $oversized ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $oversized,
			];
		} );

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/photo.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

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

	public function test_upload_media__requires_upload_files_capability() {
		// Arrange
		$user_id = self::factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		$ability = new Upload_Media_Ability();

		// Act
		$allowed = $ability->check_permission();

		// Assert
		$this->assertFalse( $allowed );
	}

	public function test_upload_token__expires() {
		// Arrange
		$this->act_as_admin();
		$issued = Media_Upload_Token_Store::issue_for_user( get_current_user_id() );
		$key = Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . hash_hmac( 'sha256', $issued['token'], wp_salt( 'auth' ) );
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

	public function test_curl_options__connect_to_the_checked_address_without_proxy_or_decoding() {
		// Act
		$options = Remote_Image_Fetcher::curl_options( 'example.com', '93.184.216.34' );

		// Assert
		$this->assertSame( [ 'example.com:443:93.184.216.34' ], $options[ CURLOPT_RESOLVE ] );
		$this->assertSame( '', $options[ CURLOPT_PROXY ] );
		$this->assertSame( '*', $options[ CURLOPT_NOPROXY ] );
		$this->assertFalse( $options[ CURLOPT_HTTP_CONTENT_DECODING ] );
		$this->assertSame( CURL_IPRESOLVE_V4, $options[ CURLOPT_IPRESOLVE ] );
	}

	public function test_fetch_to_temp_file__registers_the_curl_hook_only_during_the_request() {
		// Arrange
		if ( ! Remote_Image_Fetcher::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$priorities = [];
		$png = self::MINIMAL_PNG;

		$this->mock_http_response( static function () use ( &$priorities, $png ) {
			global $wp_filter;

			$priorities = isset( $wp_filter['http_api_curl'] ) ? array_keys( $wp_filter['http_api_curl']->callbacks ) : [];

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		// Act
		$result = Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png' );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		wp_delete_file( $result['tmp_name'] );
		$this->assertContains( PHP_INT_MAX, $priorities );
		$remaining = isset( $GLOBALS['wp_filter']['http_api_curl'] ) ? array_keys( $GLOBALS['wp_filter']['http_api_curl']->callbacks ) : [];
		$this->assertNotContains( PHP_INT_MAX, $remaining );
	}

	public function test_fetch_to_temp_file__removes_its_hooks_after_an_exception() {
		// Arrange
		if ( ! Remote_Image_Fetcher::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$curl_hooks_before = has_action( 'http_api_curl' );

		add_filter(
			'pre_http_request',
			static function () {
				throw new \Exception( 'Remote fetch test exception.' );
			},
			10,
			3
		);

		// Act
		try {
			Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png' );
		} catch ( \Exception $exception ) {
			$this->assertSame( 'Remote fetch test exception.', $exception->getMessage() );
		}

		$pre_http_priorities = array_keys( $GLOBALS['wp_filter']['pre_http_request']->callbacks );

		remove_all_filters( 'pre_http_request' );

		// Assert
		$this->assertSame( $curl_hooks_before, has_action( 'http_api_curl' ) );
		$this->assertNotContains( PHP_INT_MAX, $pre_http_priorities );
	}

	/**
	 * @dataProvider denied_ip_address_provider
	 */
	public function test_is_public_ip__rejects_denied_ranges( string $ip ) {
		// Assert
		$this->assertFalse( Remote_Image_Fetcher::is_public_ip( $ip ) );
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

	public function test_is_public_ip__accepts_ipv4_only() {
		// Assert
		$this->assertTrue( Remote_Image_Fetcher::is_public_ip( '93.184.216.34' ) );
		$this->assertFalse( Remote_Image_Fetcher::is_public_ip( '2001:4860:4860::8888' ) );
	}

	public function test_assert_fetchable_url__rejects_non_443_port() {
		// Act
		$error = Remote_Image_Fetcher::assert_fetchable_url( 'https://93.184.215.14:8443/photo.png' );

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
		$source_url = 'https://93.184.215.14/dedupe-owner.png';
		$attachment_id = self::factory()->attachment->create( [
			'post_author' => get_current_user_id(),
			'post_mime_type' => 'image/jpeg',
			'post_title' => 'Original title',
		] );
		update_post_meta( $attachment_id, Media_Upload_Config::SOURCE_URL_META_KEY, $source_url );

		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		$png = self::MINIMAL_PNG;

		$this->mock_http_response( static function () use ( $png ) {
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

		$this->clear_http_mocks();

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
	public function test_resolve_public_ip__rejects_numeric_and_invalid_hosts( string $host ) {
		// Act
		$error = Remote_Image_Fetcher::resolve_public_ip( $host );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'remote_host_not_allowed', $error->get_error_code() );
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
			'reserved name' => [ 'unresolvable.invalid' ],
		];
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
		$this->assertSame( 'remote_host_not_allowed', $result->get_error_code() );
	}

	public function test_fetch_to_temp_file__rejects_encoded_response() {
		// Arrange
		if ( ! Remote_Image_Fetcher::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$this->mock_http_response( static function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-encoding' => 'gzip' ],
				'body' => 'ok',
			];
		} );

		// Act
		$result = Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png' );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'unsupported_content_encoding', $result->get_error_code() );
	}

	public function test_fetch_to_temp_file__allows_identity_content_encoding() {
		// Arrange
		if ( ! Remote_Image_Fetcher::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$this->mock_http_response( static function () {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-encoding' => 'identity' ],
				'body' => 'ok',
			];
		} );

		// Act
		$result = Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png' );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'ok', file_get_contents( $result['tmp_name'] ) );
		wp_delete_file( $result['tmp_name'] );
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
		$request->set_body( '' );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::BAD_REQUEST, $response->get_status() );
		$this->assertSame( 'empty_file', $response->get_data()['code'] );
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

	public function test_is_public_ip__allows_public_addresses_next_to_denied_ranges() {
		// Assert
		$this->assertTrue( Remote_Image_Fetcher::is_public_ip( '198.20.0.1' ) );
		$this->assertTrue( Remote_Image_Fetcher::is_public_ip( '93.184.216.34' ) );
		$this->assertTrue( Remote_Image_Fetcher::is_public_ip( '100.128.0.1' ) );
	}

	public function test_assert_fetchable_url__rejects_userinfo() {
		// Act
		$error = Remote_Image_Fetcher::assert_fetchable_url( 'https://user@93.184.215.14/photo.png' );

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

		$this->mock_http_response( static function ( $url ) use ( $png ) {
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
			'source_url' => 'https://93.184.215.14/start.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'image/png', $result['mime'] );
	}

	public function test_upload_media__rejects_redirect_without_location() {
		// Arrange
		$this->act_as_admin();

		$this->mock_http_response( static function () {
			return [
				'response' => [ 'code' => 302 ],
				'headers' => [],
				'body' => '',
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/start.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_redirect', $result->get_error_code() );
	}

	public function test_upload_media__rejects_too_many_redirects() {
		// Arrange
		$this->act_as_admin();

		$this->mock_http_response( static function () {
			return [
				'response' => [ 'code' => 302 ],
				'headers' => [ 'location' => 'https://93.184.215.14/loop.png' ],
				'body' => '',
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$result = $ability->execute( [
			'source_url' => 'https://93.184.215.14/loop.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'too_many_redirects', $result->get_error_code() );
	}

	public function test_upload_media__does_not_store_query_string_in_source_url_meta() {
		// Arrange
		$this->act_as_admin();
		$png = self::MINIMAL_PNG;

		$this->mock_http_response( static function () use ( $png ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		$ability = new Upload_Media_Ability();

		// Act
		$with_query = $ability->execute( [
			'source_url' => 'https://93.184.215.14/signed.png?sig=abc123',
			'consent' => true,
		] );
		$with_fragment = $ability->execute( [
			'source_url' => 'https://93.184.215.14/plain.png#section',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertSame( '', (string) get_post_meta( $with_query['attachment_id'], Media_Upload_Config::SOURCE_URL_META_KEY, true ) );
		$this->assertSame(
			'https://93.184.215.14/plain.png',
			get_post_meta( $with_fragment['attachment_id'], Media_Upload_Config::SOURCE_URL_META_KEY, true )
		);
	}

	public function test_upload_media__returns_error_when_dedupe_update_is_denied() {
		// Arrange
		$this->act_as_admin();
		$source_url = 'https://93.184.215.14/dedupe-denied.png';
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

	public function test_svg_upload__is_allowed_for_administrators_only() {
		// Arrange
		add_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Act
		$this->act_as_editor();
		$allowed_for_editor = Media_Upload_Config::is_svg_upload_allowed();
		$this->act_as_admin();
		$allowed_for_admin = Media_Upload_Config::is_svg_upload_allowed();

		remove_filter( 'elementor/files/allow_unfiltered_upload', '__return_true' );

		// Assert
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

		// Act
		$upload_allowed = ( new Upload_Media_Ability() )->check_permission();
		$request_allowed = ( new Request_Media_Upload_Ability() )->check_permission();

		// Assert
		$this->assertFalse( $upload_allowed );
		$this->assertFalse( $request_allowed );
	}

	public function roles_without_upload_capability_provider(): array {
		return [
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

		// Assert
		$this->assertSame( \WP_Http::CREATED, $response->get_status() );
		$this->assertSame( 'image/png', $response->get_data()['mime'] );
		$this->assertSame( $user_id, (int) get_post( $attachment_id )->post_author );
	}

	/**
	 * @dataProvider roles_with_upload_capability_provider
	 */
	public function test_upload_media__works_for_non_administrators( string $role ) {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => $role ] ) );
		$png = self::MINIMAL_PNG;

		$this->mock_http_response( static function () use ( $png ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://93.184.215.14/' . $role . '.png',
			'consent' => true,
		] );

		$this->clear_http_mocks();

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

		$this->mock_http_response( static function () use ( $svg ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $svg,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://93.184.215.14/icon.svg',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'svg_not_allowed', $result->get_error_code() );
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

	/**
	 * @dataProvider transport_error_provider
	 */
	public function test_fetch_to_temp_file__maps_transport_errors_to_generic_codes( string $raw_message, string $expected_code ) {
		// Arrange
		if ( ! Remote_Image_Fetcher::is_curl_transport_available() ) {
			$this->markTestSkipped( 'cURL transport is not available in this environment.' );
		}

		$this->mock_http_response( static function () use ( $raw_message ) {
			return new \WP_Error( 'http_request_failed', $raw_message );
		} );

		// Act
		$result = Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png' );

		$this->clear_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( $expected_code, $result->get_error_code() );
		$this->assertStringNotContainsString( 'cURL', $result->get_error_message() );
		$this->assertStringNotContainsString( 'resolve', strtolower( $result->get_error_message() ) );
	}

	public function transport_error_provider(): array {
		return [
			'resolution failure' => [ 'cURL error 6: Could not resolve host: internal.example', 'fetch_failed' ],
			'refused connection' => [ 'cURL error 7: Failed to connect to 10.0.0.5 port 443', 'fetch_failed' ],
			'timeout' => [ 'cURL error 28: Operation timed out after 30001 milliseconds', 'fetch_timeout' ],
			'url refused by WordPress' => [ 'A valid URL was not provided.', 'remote_host_not_allowed' ],
		];
	}

	public function test_host_errors__share_one_generic_code() {
		// Act
		$blocked = Remote_Image_Fetcher::resolve_public_ip( '10.0.0.5' );
		$unresolvable = Remote_Image_Fetcher::resolve_public_ip( 'unresolvable.invalid' );

		// Assert
		$this->assertWPError( $blocked );
		$this->assertWPError( $unresolvable );
		$this->assertSame( 'remote_host_not_allowed', $blocked->get_error_code() );
		$this->assertSame( $blocked->get_error_code(), $unresolvable->get_error_code() );
		$this->assertSame( $blocked->get_error_message(), $unresolvable->get_error_message() );
	}

	public function test_is_proxy_in_use__follows_the_proxy_configuration() {
		// Arrange
		$enabled_proxy = new class() extends \WP_HTTP_Proxy {
			public function is_enabled() {
				return true;
			}

			public function send_through_proxy( $uri ) {
				return true;
			}
		};

		$disabled_proxy = new class() extends \WP_HTTP_Proxy {
			public function is_enabled() {
				return false;
			}
		};

		// Assert
		$this->assertTrue( Remote_Image_Fetcher::is_proxy_in_use( 'https://93.184.215.14/photo.png', $enabled_proxy ) );
		$this->assertFalse( Remote_Image_Fetcher::is_proxy_in_use( 'https://93.184.215.14/photo.png', $disabled_proxy ) );
	}

	public function test_fetch_to_temp_file__stops_when_the_overall_deadline_passes() {
		// Arrange
		$calls = 0;
		$clock = static function () use ( &$calls ) {
			$calls++;

			return 1 === $calls ? 1000.0 : 1000.0 + Media_Upload_Config::TOTAL_FETCH_TIMEOUT_SECONDS + 1;
		};

		// Act
		$result = Remote_Image_Fetcher::fetch_to_temp_file( 'https://93.184.215.14/photo.png', null, $clock );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'fetch_timeout', $result->get_error_code() );
	}

	private function mock_png_for_all_urls(): void {
		$png = self::MINIMAL_PNG;

		$this->mock_http_response( static function () use ( $png ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );
	}

	public function test_upload_media__list_imports_each_url() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [
				[ 'source_url' => 'https://93.184.215.14/list-a.png' ],
				[ 'source_url' => 'https://93.184.215.14/list-b.png' ],
				[ 'source_url' => 'https://93.184.215.14/list-c.png' ],
			],
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 3, $result['total'] );
		$this->assertSame( 3, $result['succeeded'] );
		$this->assertSame( 0, $result['failed'] );
		$this->assertCount( 3, $result['uploads'] );

		$ids = [];
		foreach ( $result['uploads'] as $position => $entry ) {
			$this->assertSame( $position, $entry['index'] );
			$this->assertSame( 'ok', $entry['status'] );
			$this->assertSame( 'image/png', $entry['mime'] );
			$this->assertArrayNotHasKey( 'error', $entry );
			$ids[] = $entry['attachment_id'];
		}

		$this->assertCount( 3, array_unique( $ids ) );
		$this->assertSame( 'https://93.184.215.14/list-b.png', $result['uploads'][1]['source_url'] );
	}

	public function test_upload_media__list_reports_partial_failures_and_continues() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [
				[ 'source_url' => 'https://127.0.0.1/blocked.png?token=secret#frag' ],
				[ 'source_url' => 'https://93.184.215.14/partial-ok.png' ],
				[ 'source_url' => 'http://93.184.215.14/plain-http.png' ],
			],
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 3, $result['total'] );
		$this->assertSame( 1, $result['succeeded'] );
		$this->assertSame( 2, $result['failed'] );

		$this->assertSame( 'error', $result['uploads'][0]['status'] );
		$this->assertSame( 'remote_host_not_allowed', $result['uploads'][0]['error']['code'] );
		$this->assertSame( 'https://127.0.0.1/blocked.png', $result['uploads'][0]['source_url'] );
		$this->assertArrayNotHasKey( 'attachment_id', $result['uploads'][0] );

		$this->assertSame( 'ok', $result['uploads'][1]['status'] );
		$this->assertGreaterThan( 0, $result['uploads'][1]['attachment_id'] );

		$this->assertSame( 'error', $result['uploads'][2]['status'] );
		$this->assertSame( 'invalid_url_scheme', $result['uploads'][2]['error']['code'] );
	}

	public function test_upload_media__list_returns_per_item_errors_when_all_fail() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [ [ 'source_url' => 'https://127.0.0.1/a.png' ], [ 'source_url' => 'http://93.184.215.14/b.png' ] ],
			'consent' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 0, $result['succeeded'] );
		$this->assertSame( 2, $result['failed'] );
		$this->assertSame( 'error', $result['uploads'][0]['status'] );
		$this->assertSame( 'error', $result['uploads'][1]['status'] );
	}

	public function test_upload_media__list_rejects_more_than_the_maximum() {
		// Arrange
		$this->act_as_admin();
		$images = [];
		for ( $i = 0; $i <= Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST; $i++ ) {
			$images[] = [ 'source_url' => 'https://93.184.215.14/too-many-' . $i . '.png' ];
		}

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => $images,
			'consent' => true,
		] );

		// Assert
		$this->assertCount( 6, $images );
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_upload_count', $result->get_error_code() );
		$this->assertStringContainsString( '5', $result->get_error_message() );
	}

	public function test_upload_media__list_accepts_exactly_the_maximum() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();
		$images = [];
		for ( $i = 0; $i < Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST; $i++ ) {
			$images[] = [ 'source_url' => 'https://93.184.215.14/max-' . $i . '.png' ];
		}

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => $images,
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 5, $result['succeeded'] );
	}

	public function test_upload_media__list_applies_title_and_alt_per_image() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [
				[
					'source_url' => 'https://93.184.215.14/meta-a.png',
					'title' => 'First title',
					'alt' => 'First alt',
				],
				[ 'source_url' => 'https://93.184.215.14/meta-b.png' ],
			],
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertSame( 2, $result['succeeded'] );
		$this->assertSame( 'First alt', $result['uploads'][0]['alt'] );
		$this->assertSame( 'First title', get_post( $result['uploads'][0]['attachment_id'] )->post_title );
		$this->assertSame( '', $result['uploads'][1]['alt'] );
	}

	public function test_upload_media__list_rejects_empty_list() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [],
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_upload_count', $result->get_error_code() );
	}

	public function test_upload_media__rejects_both_single_and_list_inputs() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://93.184.215.14/one.png',
			'images' => [ [ 'source_url' => 'https://93.184.215.14/two.png' ] ],
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'conflicting_source_inputs', $result->get_error_code() );
	}

	/**
	 * @dataProvider invalid_list_entries_provider
	 */
	public function test_upload_media__list_rejects_invalid_entries( array $images ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => $images,
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_source_url', $result->get_error_code() );
	}

	public function invalid_list_entries_provider(): array {
		return [
			'integer source_url' => [ [ [ 'source_url' => 'https://93.184.215.14/a.png' ], [ 'source_url' => 12 ] ] ],
			'null entry' => [ [ null ] ],
			'string entry' => [ [ 'https://93.184.215.14/a.png' ] ],
			'missing source_url' => [ [ [ 'title' => 'No URL' ] ] ],
			'empty source_url' => [ [ [ 'source_url' => '' ] ] ],
			'blank source_url' => [ [ [ 'source_url' => '   ' ] ] ],
		];
	}

	public function test_upload_media__list_rejects_title_and_alt() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [ [ 'source_url' => 'https://93.184.215.14/a.png' ] ],
			'title' => 'Shared title',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'unsupported_with_images', $result->get_error_code() );
	}

	public function test_upload_media__list_requires_upload_files_capability_for_the_whole_call() {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );

		// Act
		$allowed = ( new Upload_Media_Ability() )->check_permission();

		// Assert
		$this->assertFalse( $allowed );
	}

	public function test_upload_media__list_applies_svg_rule_per_item_for_editor() {
		// Arrange
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'editor' ] ) );
		$png = self::MINIMAL_PNG;
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>';

		$this->mock_http_response( static function ( $url ) use ( $png, $svg ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => false !== strpos( $url, '.svg' ) ? $svg : $png,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'images' => [
				[ 'source_url' => 'https://93.184.215.14/list-svg-first.svg' ],
				[ 'source_url' => 'https://93.184.215.14/list-after-svg.png' ],
			],
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 1, $result['succeeded'] );
		$this->assertSame( 'error', $result['uploads'][0]['status'] );
		$this->assertSame( 'svg_not_allowed', $result['uploads'][0]['error']['code'] );
		$this->assertSame( 'ok', $result['uploads'][1]['status'] );
	}

	public function test_upload_media__list_returns_existing_attachment_for_a_repeated_url() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();
		$ability = new Upload_Media_Ability();
		$url = 'https://93.184.215.14/list-repeat.png';

		// Act
		$result = $ability->execute( [
			'images' => [ [ 'source_url' => $url ], [ 'source_url' => $url ] ],
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertSame( 2, $result['succeeded'] );
		$this->assertSame( $result['uploads'][0]['attachment_id'], $result['uploads'][1]['attachment_id'] );
	}

	public function test_upload_media__single_url_response_shape_is_unchanged() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://93.184.215.14/single-shape.png',
			'title' => 'Single title',
			'alt' => 'Single alt',
			'consent' => true,
		] );

		$this->clear_http_mocks();

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame(
			[ 'attachment_id', 'url', 'mime', 'width', 'height', 'alt' ],
			array_keys( $result )
		);
		$this->assertSame( 'Single alt', $result['alt'] );
		$this->assertSame( 'Single title', get_post( $result['attachment_id'] )->post_title );
	}

	public function test_upload_media__single_url_still_returns_wp_error_on_failure() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [
			'source_url' => 'https://127.0.0.1/single.png',
			'consent' => true,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'remote_host_not_allowed', $result->get_error_code() );
	}

	public function test_upload_media__missing_source_still_returns_invalid_source_url() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = ( new Upload_Media_Ability() )->execute( [ 'consent' => true ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_source_url', $result->get_error_code() );
	}

	public function test_upload_media__list_schema_limits_the_list_to_the_maximum() {
		// Arrange
		$method = new \ReflectionMethod( Upload_Media_Ability::class, 'get_definition' );
		$method->setAccessible( true );
		$properties = $method->invoke( new Upload_Media_Ability() )->input_schema['properties'];
		$schema = $properties['images'] ?? null;

		// Assert
		$this->assertArrayNotHasKey( 'source_urls', $properties );
		$this->assertNotNull( $schema );
		$this->assertSame( 1, $schema['minItems'] );
		$this->assertSame( Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST, $schema['maxItems'] );
		$this->assertSame( 'object', $schema['items']['type'] );
		$this->assertSame( [ 'source_url' ], $schema['items']['required'] );
	}

	public function test_upload_media__batch_reports_remaining_urls_as_timeouts_after_the_batch_deadline() {
		// Arrange
		$this->act_as_admin();
		$now = 1000.0;
		$png = self::MINIMAL_PNG;
		$clock = static function () use ( &$now ) {
			return $now;
		};

		// The first download uses up the whole batch time.
		$this->mock_http_response( static function () use ( &$now, $png ) {
			$now += Media_Upload_Config::TOTAL_BATCH_TIMEOUT_SECONDS + 1;

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $png,
			];
		} );

		// Act
		$result = ( new Upload_Media_Ability() )->import_batch(
			[
				[ 'source_url' => 'https://93.184.215.14/batch-a.png' ],
				[ 'source_url' => 'https://93.184.215.14/batch-b.png' ],
				[ 'source_url' => 'https://93.184.215.14/batch-c.png' ],
			],
			$clock
		);

		$this->clear_http_mocks();

		// Assert
		$this->assertSame( 1, $result['succeeded'] );
		$this->assertSame( 2, $result['failed'] );
		$this->assertSame( 'ok', $result['uploads'][0]['status'] );
		$this->assertSame( 'fetch_timeout', $result['uploads'][1]['error']['code'] );
		$this->assertSame( 'fetch_timeout', $result['uploads'][2]['error']['code'] );
	}

	public function test_upload_media__batch_deadline_also_bounds_each_download() {
		// Arrange
		$this->act_as_admin();
		$this->mock_png_for_all_urls();
		$calls = 0;
		$clock = static function () use ( &$calls ) {
			$calls++;

			// Call 1 sets the batch deadline; the image starts half a second before it.
			return 1 === $calls ? 1000.0 : 1000.0 + Media_Upload_Config::TOTAL_BATCH_TIMEOUT_SECONDS - 0.5;
		};

		// Act
		$result = ( new Upload_Media_Ability() )->import_batch(
			[ [ 'source_url' => 'https://93.184.215.14/batch-late.png' ] ],
			$clock
		);

		$this->clear_http_mocks();

		// Assert
		$this->assertSame( 0, $result['succeeded'] );
		$this->assertSame( 'fetch_timeout', $result['uploads'][0]['error']['code'] );
	}

	public function test_upload_token__detects_type_from_content_regardless_of_extension() {
		// Arrange
		$this->act_as_admin();
		$issued = ( new Request_Media_Upload_Ability() )->execute( [ 'consent' => true ] );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-media-upload' );
		$request->set_header( Media_Upload_Config::UPLOAD_TOKEN_HEADER, $issued['upload_token'] );
		$request->set_header( Media_Upload_Config::UPLOAD_FILENAME_HEADER, 'holiday-photo.heic' );
		$request->set_body( self::MINIMAL_PNG );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::CREATED, $response->get_status() );
		$this->assertSame( 'image/png', $response->get_data()['mime'] );
		$this->assertStringEndsWith( '.png', (string) get_attached_file( $response->get_data()['attachment_id'] ) );
	}
}
