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
		if ( ! self::is_curl_transport_available() ) {
			return new \WP_Error(
				'remote_fetch_unavailable',
				__( 'Remote image fetch is not available on this server.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		if ( self::is_proxy_in_use( $url ) ) {
			return new \WP_Error(
				'remote_fetch_proxy_unsupported',
				__( 'Remote image fetch is not available when the server sends requests through a proxy.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		$resolve_entry = self::build_curl_resolve_entry( $host, $pinned_ip );
		if ( is_wp_error( $resolve_entry ) ) {
			return $resolve_entry;
		}

		$curl_resolve_applied = false;

		$hook = static function ( $handle ) use ( $resolve_entry, &$curl_resolve_applied ) {
			if ( ! is_resource( $handle ) && ! ( is_object( $handle ) && $handle instanceof \CurlHandle ) ) {
				return;
			}

			curl_setopt( $handle, self::curl_resolve_option(), [ $resolve_entry ] );
			$curl_resolve_applied = true;

			if ( defined( 'CURLOPT_HTTP_CONTENT_DECODING' ) ) {
				curl_setopt( $handle, CURLOPT_HTTP_CONTENT_DECODING, false );
			}
		};

		add_action( 'http_api_curl', $hook, 10, 1 );

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
				self::prime_curl_resolve_hook( $hook, $curl_resolve_applied );
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
		}

		if ( ! $curl_resolve_applied ) {
			return new \WP_Error(
				'remote_fetch_unpinned',
				__( 'Remote image fetch could not pin the resolved host address.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		if ( ! is_wp_error( $response ) && self::has_content_encoding( $response ) ) {
			return new \WP_Error(
				'unsupported_content_encoding',
				__( 'The source server returned an encoded response, which is not supported.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $response;
	}

	public static function is_proxy_in_use( string $url ): bool {
		if ( ! class_exists( '\WP_HTTP_Proxy' ) ) {
			return false;
		}

		$proxy = new \WP_HTTP_Proxy();

		return $proxy->is_enabled() && $proxy->send_through_proxy( $url );
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
		return class_exists( '\WP_Http_Curl' ) && function_exists( 'curl_version' );
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
			return new \WP_Error(
				'host_resolution_failed',
				__( 'The source host could not be resolved.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
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

	private static function prime_curl_resolve_hook( callable $hook, bool &$curl_resolve_applied ): void {
		if ( ! function_exists( 'curl_init' ) ) {
			return;
		}

		$handle = curl_init();
		if ( false === $handle ) {
			return;
		}

		$hook( $handle );

		if ( is_resource( $handle ) || $handle instanceof \CurlHandle ) {
			curl_close( $handle );
		}
	}
}
