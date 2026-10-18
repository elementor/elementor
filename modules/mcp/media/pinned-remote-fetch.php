<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pinned_Remote_Fetch {

	private const CURL_RESOLVE_OPTION = 10203;

	private static function curl_resolve_option(): int {
		return defined( 'CURLOPT_RESOLVE' ) ? CURLOPT_RESOLVE : self::CURL_RESOLVE_OPTION;
	}

	/**
	 * @return array{response:array}|WP_Error
	 */
	public static function get( string $url, string $host, string $pinned_ip, ?int $timeout = null ) {
		if ( ! self::is_curl_transport_available() || self::is_proxy_in_use( $url ) ) {
			return new \WP_Error(
				'remote_fetch_unavailable',
				__( 'Remote image fetch is not available on this server.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		$resolve_entry = self::build_curl_resolve_entry( $host, $pinned_ip );
		if ( is_wp_error( $resolve_entry ) ) {
			return $resolve_entry;
		}

		$curl_resolve_applied = false;

		// Both hooks only act on the request made for this fetch, so other HTTP requests
		// that run while it is in flight are left untouched.
		$hook = static function ( $handle, $parsed_args = null, $request_url = null ) use ( $url, $resolve_entry, &$curl_resolve_applied ) {
			if ( ! self::matches_fetch_url( $url, $request_url ) || ! self::is_curl_handle( $handle ) ) {
				return;
			}

			self::apply_options( $handle, self::pin_options( $resolve_entry ) );
			$curl_resolve_applied = true;
		};

		$direct_connection_hook = static function ( $handle, $parsed_args = null, $request_url = null ) use ( $url ) {
			if ( ! self::matches_fetch_url( $url, $request_url ) || ! self::is_curl_handle( $handle ) ) {
				return;
			}

			self::apply_options( $handle, self::direct_connection_options() );
		};

		add_action( 'http_api_curl', $hook, 10, 3 );
		add_action( 'http_api_curl', $direct_connection_hook, PHP_INT_MAX, 3 );

		$response = null;

		$response_override = null;
		if ( defined( 'WP_TESTS_DOMAIN' ) && WP_TESTS_DOMAIN ) {
			/**
			 * @param array{response:array,headers:array,body:string}|null $response_override PHPUnit may supply a canned HTTP response without preempting cURL.
			 */
			$response_override = apply_filters( 'elementor/mcp/media/pinned_fetch_http_response', null, $url, $host, $pinned_ip );
		}

		try {
			if ( null !== $response_override ) {
				self::prime_curl_resolve_hook( $hook, $url );
				$response = $response_override;
			} else {
				$response = wp_remote_get(
					$url,
					[
						'timeout' => null === $timeout ? Media_Upload_Config::FETCH_TIMEOUT_SECONDS : max( 1, min( $timeout, Media_Upload_Config::FETCH_TIMEOUT_SECONDS ) ),
						'redirection' => 0,
						'reject_unsafe_urls' => false,
						'limit_response_size' => Media_Upload_Config::max_upload_bytes() + 1,
						'decompress' => false,
						'headers' => [ 'Accept-Encoding' => 'identity' ],
					]
				);
			}
		} finally {
			remove_action( 'http_api_curl', $hook, 10 );
			remove_action( 'http_api_curl', $direct_connection_hook, PHP_INT_MAX );
		}

		if ( ! $curl_resolve_applied ) {
			return new \WP_Error(
				'remote_fetch_unpinned',
				__( 'Remote image fetch could not pin the resolved host address.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		if ( is_wp_error( $response ) ) {
			return self::generic_fetch_error( $response );
		}

		if ( self::has_content_encoding( $response ) ) {
			return new \WP_Error(
				'unsupported_content_encoding',
				__( 'The source server returned an encoded response, which is not supported.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $response;
	}

	/**
	 * Proxies set in the WordPress configuration make the request refuse to run.
	 * Proxy settings from the environment are ignored instead: the request is kept on a
	 * direct connection to the validated address, so hosts that need an outbound proxy
	 * have to use the token upload.
	 */
	public static function is_proxy_in_use( string $url, ?\WP_HTTP_Proxy $proxy = null ): bool {
		if ( ! class_exists( '\WP_HTTP_Proxy' ) ) {
			return false;
		}

		$proxy = $proxy ?? new \WP_HTTP_Proxy();

		return $proxy->is_enabled() && $proxy->send_through_proxy( $url );
	}

	public static function matches_fetch_url( string $fetch_url, $request_url ): bool {
		if ( ! is_string( $request_url ) ) {
			return false;
		}

		$expected = wp_parse_url( $fetch_url );
		$actual = wp_parse_url( $request_url );

		if ( ! is_array( $expected ) || ! is_array( $actual ) ) {
			return false;
		}

		$normalize = static function ( array $parts ): array {
			return [
				strtolower( (string) ( $parts['scheme'] ?? '' ) ),
				strtolower( (string) ( $parts['host'] ?? '' ) ),
				(int) ( $parts['port'] ?? 443 ),
				(string) ( $parts['path'] ?? '/' ),
				(string) ( $parts['query'] ?? '' ),
			];
		};

		return $normalize( $expected ) === $normalize( $actual );
	}

	/**
	 * @return array<int,mixed> cURL options that pin the connection to the validated address.
	 */
	public static function pin_options( string $resolve_entry ): array {
		$options = [ self::curl_resolve_option() => [ $resolve_entry ] ];

		if ( defined( 'CURLOPT_HTTP_CONTENT_DECODING' ) ) {
			$options[ CURLOPT_HTTP_CONTENT_DECODING ] = false;
		}

		return $options;
	}

	/**
	 * @return array<int,mixed> cURL options that keep the request off any proxy.
	 */
	public static function direct_connection_options(): array {
		return [
			CURLOPT_PROXY => '',
			CURLOPT_NOPROXY => '*',
		];
	}

	private static function is_curl_handle( $handle ): bool {
		return is_resource( $handle ) || ( is_object( $handle ) && $handle instanceof \CurlHandle );
	}

	private static function apply_options( $handle, array $options ): void {
		foreach ( $options as $option => $value ) {
			curl_setopt( $handle, $option, $value );
		}
	}

	private static function generic_fetch_error( \WP_Error $error ): \WP_Error {
		$message = strtolower( $error->get_error_message() );

		if ( str_contains( $message, 'timed out' ) || str_contains( $message, 'curl error 28' ) ) {
			return new \WP_Error(
				'fetch_timeout',
				__( 'Downloading the image took too long.', 'elementor' ),
				[ 'status' => \WP_Http::GATEWAY_TIMEOUT ]
			);
		}

		return new \WP_Error(
			'fetch_failed',
			__( 'Could not download the image from the source URL.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private static function has_content_encoding( $response ): bool {
		$encoding = wp_remote_retrieve_header( $response, 'content-encoding' );

		if ( is_array( $encoding ) ) {
			$encoding = implode( ',', $encoding );
		}

		if ( ! is_string( $encoding ) ) {
			return false;
		}

		$encoding = strtolower( trim( $encoding ) );

		return '' !== $encoding && 'identity' !== $encoding;
	}

	public static function is_curl_transport_available(): bool {
		if ( ! function_exists( 'curl_init' ) ) {
			return false;
		}

		if ( class_exists( '\WpOrg\Requests\Transport\Curl' ) ) {
			return \WpOrg\Requests\Transport\Curl::test( [ 'ssl' => true ] );
		}

		if ( class_exists( '\Requests_Transport_cURL' ) ) {
			return \Requests_Transport_cURL::test( [ 'ssl' => true ] );
		}

		return false;
	}

	/**
	 * @return string|WP_Error
	 */
	public static function build_curl_resolve_entry( string $host, string $ip ) {
		$host = strtolower( trim( $host, '[]' ) );

		if ( '' === $host ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! filter_var( $host, FILTER_VALIDATE_IP ) && ! Public_Host_Validator::is_strict_dns_name( $host ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 ) ) {
			return $host . ':443:[' . $ip . ']';
		}

		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			return $host . ':443:' . $ip;
		}

		return new \WP_Error(
			'invalid_url',
			__( 'The source URL is not valid.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	public static function select_pinned_ip( string $host ) {
		$ips = Public_Host_Validator::resolve_dns( $host );
		if ( null === $ips || [] === $ips ) {
			return Public_Host_Validator::host_not_allowed_error();
		}

		foreach ( $ips as $ip ) {
			$ip_error = Public_Host_Validator::assert_public_ip( $ip );
			if ( $ip_error ) {
				return $ip_error;
			}
		}

		foreach ( $ips as $ip ) {
			if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
				return $ip;
			}
		}

		return $ips[0];
	}

	private static function prime_curl_resolve_hook( callable $hook, string $url ): void {
		if ( ! function_exists( 'curl_init' ) ) {
			return;
		}

		$handle = curl_init();
		if ( false === $handle ) {
			return;
		}

		$hook( $handle, [], $url );

		if ( is_resource( $handle ) || $handle instanceof \CurlHandle ) {
			curl_close( $handle );
		}
	}
}
