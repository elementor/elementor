<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Media;

use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Pinned_Remote_Fetch;
use Elementor\Modules\Mcp\Media\Public_Host_Validator;
use Elementor\Modules\Mcp\Media\Safe_Remote_Image_Fetcher;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Remote_Fetch_Security extends Elementor_Test_Base {

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

	public function test_public_host_validator__rejects_loopback_ip() {
		// Arrange
		$error = Public_Host_Validator::assert_public_ip( '127.0.0.1' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'private_host_blocked', $error->get_error_code() );
	}

	public function test_assert_https_url__rejects_http_scheme() {
		// Act
		$error = Public_Host_Validator::assert_https_url( 'http://example.com/image.png' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'invalid_url_scheme', $error->get_error_code() );
	}

	public function test_assert_https_url__rejects_private_ip_literal() {
		// Act
		$error = Public_Host_Validator::assert_https_url( 'https://127.0.0.1/image.png' );

		// Assert
		$this->assertWPError( $error );
		$this->assertSame( 'private_host_blocked', $error->get_error_code() );
	}

	public function test_safe_remote_fetch__rejects_redirect_to_private_host() {
		// Arrange
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
		$result = Safe_Remote_Image_Fetcher::fetch_to_temp_file( 'https://example.com/image.png' );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'private_host_blocked', $result->get_error_code() );
	}

	public function test_safe_remote_fetch__rejects_response_larger_than_cap() {
		// Arrange
		$oversized = str_repeat( 'x', Media_Upload_Config::max_upload_bytes() + 1 );

		$this->mock_pinned_http_response( static function () use ( $oversized ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => $oversized,
			];
		} );

		// Act
		$result = Safe_Remote_Image_Fetcher::fetch_to_temp_file( 'https://example.com/photo.png' );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
	}

	public function test_safe_remote_fetch__rejects_content_length_larger_than_cap() {
		// Arrange
		$limit = Media_Upload_Config::max_upload_bytes();

		$this->mock_pinned_http_response( static function () use ( $limit ) {
			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-length' => (string) ( $limit + 1 ) ],
				'body' => 'small-body',
			];
		} );

		// Act
		$result = Safe_Remote_Image_Fetcher::fetch_to_temp_file( 'https://example.com/photo.png' );

		$this->clear_pinned_http_mocks();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'file_too_large', $result->get_error_code() );
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
}
