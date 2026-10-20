<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Downloads a remote image with the WordPress HTTP API (wp_safe_remote_get()).
 *
 * Redirects are followed here, one hop at a time, so every hop gets the same URL and host
 * checks as the first request. Each hop connects to the address that was checked for it.
 */
class Remote_Image_Fetcher {

	/**
	 * Non-public IPv4 ranges, checked in addition to wp_http_validate_url(). Older WordPress
	 * releases only cover loopback and the RFC 1918 ranges, and none cover 168.63.129.16.
	 */
	private const DENIED_IPV4_RANGES = [
		[ '0.0.0.0', 8 ],
		[ '10.0.0.0', 8 ],
		[ '100.64.0.0', 10 ],
		[ '127.0.0.0', 8 ],
		[ '168.63.129.16', 32 ],
		[ '169.254.0.0', 16 ],
		[ '172.16.0.0', 12 ],
		[ '192.0.0.0', 24 ],
		[ '192.0.2.0', 24 ],
		[ '192.88.99.0', 24 ],
		[ '192.168.0.0', 16 ],
		[ '198.18.0.0', 15 ],
		[ '198.51.100.0', 24 ],
		[ '203.0.113.0', 24 ],
		[ '224.0.0.0', 4 ],
		[ '240.0.0.0', 4 ],
	];

	private const REDIRECT_STATUSES = [ 301, 302, 303, 307, 308 ];

	/**
	 * @param string        $source_url HTTPS image URL.
	 * @param float|null    $deadline Unix time (seconds) by which the download must finish.
	 * @param callable|null $clock    Returns the current time in seconds; defaults to microtime( true ).
	 *
	 * @return array{tmp_name:string,name:string}|\WP_Error
	 */
	public static function fetch_to_temp_file( string $source_url, ?float $deadline = null, ?callable $clock = null ) {
		Media_Attachment_Service::load_admin_media_includes();

		$clock = $clock ?? static fn(): float => microtime( true );
		$deadline = min(
			$deadline ?? PHP_FLOAT_MAX,
			$clock() + Media_Upload_Config::TOTAL_FETCH_TIMEOUT_SECONDS
		);

		$current_url = $source_url;

		for ( $hop = 0; $hop <= Media_Upload_Config::MAX_REDIRECT_HOPS; $hop++ ) {
			$remaining = (int) floor( $deadline - $clock() );
			if ( $remaining < 1 ) {
				return self::timeout_error();
			}

			$url_error = self::assert_fetchable_url( $current_url );
			if ( $url_error ) {
				return $url_error;
			}

			$host = strtolower( (string) wp_parse_url( $current_url, PHP_URL_HOST ) );
			$ip = self::resolve_public_ip( $host );
			if ( is_wp_error( $ip ) ) {
				return $ip;
			}

			$response = self::request( $current_url, $host, $ip, min( $remaining, Media_Upload_Config::FETCH_TIMEOUT_SECONDS ) );
			if ( is_wp_error( $response ) ) {
				return $response;
			}

			$status = (int) wp_remote_retrieve_response_code( $response );

			if ( in_array( $status, self::REDIRECT_STATUSES, true ) ) {
				$location = wp_remote_retrieve_header( $response, 'location' );
				if ( ! is_string( $location ) || '' === trim( $location ) ) {
					return self::invalid_redirect_error();
				}

				$current_url = \WP_Http::make_absolute_url( trim( $location ), $current_url );

				continue;
			}

			if ( 200 !== $status ) {
				return self::fetch_failed_error();
			}

			return self::write_body_to_temp_file( $response, $current_url );
		}

		return new \WP_Error(
			'too_many_redirects',
			__( 'The source URL redirected too many times.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * HTTPS on the default port, without credentials, and accepted by wp_http_validate_url().
	 */
	public static function assert_fetchable_url( string $url ): ?\WP_Error {
		$parts = wp_parse_url( $url );

		if ( ! is_array( $parts ) || empty( $parts['scheme'] ) || empty( $parts['host'] ) || isset( $parts['user'] ) || isset( $parts['pass'] ) ) {
			return self::invalid_url_error();
		}

		if ( 'https' !== strtolower( $parts['scheme'] ) ) {
			return new \WP_Error(
				'invalid_url_scheme',
				__( 'Only HTTPS source URLs are allowed.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( isset( $parts['port'] ) && 443 !== (int) $parts['port'] ) {
			return new \WP_Error(
				'invalid_url_port',
				__( 'Only the default HTTPS port is allowed.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! wp_http_validate_url( $url ) ) {
			return self::host_not_allowed_error();
		}

		return null;
	}

	/**
	 * Resolves the host and returns the IPv4 address the request will connect to. Every address
	 * the host resolves to must pass wp_http_validate_url(), otherwise the host is refused.
	 *
	 * @return string|\WP_Error
	 */
	public static function resolve_public_ip( string $host ) {
		$host = trim( $host, '.' );

		$ips = filter_var( $host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ? [ $host ] : gethostbynamel( $host );

		if ( ! is_array( $ips ) || [] === $ips ) {
			return self::host_not_allowed_error();
		}

		foreach ( $ips as $ip ) {
			if ( ! self::is_public_ip( $ip ) ) {
				return self::host_not_allowed_error();
			}
		}

		return $ips[0];
	}

	public static function is_public_ip( string $ip ): bool {
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			return false;
		}

		$long = ip2long( $ip );

		foreach ( self::DENIED_IPV4_RANGES as [ $network, $prefix_length ] ) {
			$mask = ( 0xffffffff << ( 32 - $prefix_length ) ) & 0xffffffff;

			if ( ( $long & $mask ) === ( ip2long( $network ) & $mask ) ) {
				return false;
			}
		}

		// Checked as an address URL so wp_http_validate_url() applies its address ranges without a DNS lookup.
		return false !== wp_http_validate_url( 'https://' . $ip . '/' );
	}

	/**
	 * One generic error for every host that cannot be used.
	 */
	public static function host_not_allowed_error(): \WP_Error {
		return new \WP_Error(
			'remote_host_not_allowed',
			__( 'The source host cannot be used.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	public static function is_curl_transport_available(): bool {
		return function_exists( 'curl_init' )
			&& class_exists( '\WpOrg\Requests\Transport\Curl' )
			&& \WpOrg\Requests\Transport\Curl::test( [ 'ssl' => true ] );
	}

	public static function is_proxy_in_use( string $url, ?\WP_HTTP_Proxy $proxy = null ): bool {
		$proxy = $proxy ?? new \WP_HTTP_Proxy();

		return $proxy->is_enabled() && $proxy->send_through_proxy( $url );
	}

	/**
	 * @return array<int,mixed> cURL options that connect to the checked address, keep the request off any proxy and leave the body undecoded.
	 */
	public static function curl_options( string $host, string $ip ): array {
		return [
			CURLOPT_RESOLVE => [ $host . ':443:' . $ip ],
			CURLOPT_PROXY => '',
			CURLOPT_NOPROXY => '*',
			CURLOPT_HTTP_CONTENT_DECODING => false,
			CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
		];
	}

	/**
	 * @return array|\WP_Error
	 */
	private static function request( string $url, string $host, string $ip, int $timeout ) {
		// The connection is pinned through cURL, so cURL must be the transport before anything is sent.
		if ( ! self::is_curl_transport_available() || self::is_proxy_in_use( $url ) ) {
			return new \WP_Error(
				'remote_fetch_unavailable',
				__( 'Remote image fetch is not available on this server.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		$pinned = false;
		$preempted = false;

		$pin = static function ( $handle, $parsed_args, $request_url ) use ( $url, $host, $ip, &$pinned ) {
			if ( $request_url !== $url ) {
				return;
			}

			curl_setopt_array( $handle, self::curl_options( $host, $ip ) );
			$pinned = true;
		};

		// A response supplied through pre_http_request opens no connection, so there is nothing to pin.
		$observe_preempt = static function ( $preempt, $parsed_args, $request_url ) use ( $url, &$preempted ) {
			if ( false !== $preempt && $request_url === $url ) {
				$preempted = true;
			}

			return $preempt;
		};

		add_action( 'http_api_curl', $pin, PHP_INT_MAX, 3 );
		add_filter( 'pre_http_request', $observe_preempt, PHP_INT_MAX, 3 );

		try {
			$response = wp_safe_remote_get( $url, [
				'timeout' => max( 1, $timeout ),
				'redirection' => 0,
				'limit_response_size' => Media_Upload_Config::max_upload_bytes() + 1,
				'decompress' => false,
				'headers' => [ 'Accept-Encoding' => 'identity' ],
			] );
		} finally {
			remove_action( 'http_api_curl', $pin, PHP_INT_MAX );
			remove_filter( 'pre_http_request', $observe_preempt, PHP_INT_MAX );
		}

		if ( is_wp_error( $response ) ) {
			return self::map_transport_error( $response );
		}

		if ( ! $pinned && ! $preempted ) {
			return new \WP_Error(
				'remote_fetch_unpinned',
				__( 'Remote image fetch could not connect to the checked host address.', 'elementor' ),
				[ 'status' => \WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		$encoding = wp_remote_retrieve_header( $response, 'content-encoding' );
		$encoding = strtolower( trim( is_array( $encoding ) ? implode( ',', $encoding ) : (string) $encoding ) );

		if ( '' !== $encoding && 'identity' !== $encoding ) {
			return new \WP_Error(
				'unsupported_content_encoding',
				__( 'The source server returned an encoded response, which is not supported.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $response;
	}

	/**
	 * @return array{tmp_name:string,name:string}|\WP_Error
	 */
	private static function write_body_to_temp_file( array $response, string $url ) {
		$body = wp_remote_retrieve_body( $response );
		$size = strlen( $body );

		if ( $size > Media_Upload_Config::max_upload_bytes() ) {
			return new \WP_Error(
				'file_too_large',
				__( 'The downloaded image exceeds the allowed size limit.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( 0 === $size ) {
			return new \WP_Error(
				'empty_file',
				__( 'The downloaded image is empty.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$filename = self::filename_from_url( $url );
		$tmp = wp_tempnam( $filename );

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		if ( ! $tmp || false === file_put_contents( $tmp, $body ) ) {
			if ( $tmp ) {
				wp_delete_file( $tmp );
			}

			return new \WP_Error(
				'temp_file_failed',
				__( 'Could not write the downloaded image to disk.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return [
			'tmp_name' => $tmp,
			'name' => $filename,
		];
	}

	private static function map_transport_error( \WP_Error $error ): \WP_Error {
		$message = strtolower( $error->get_error_message() );

		if ( str_contains( $message, 'timed out' ) || str_contains( $message, 'curl error 28' ) ) {
			return self::timeout_error();
		}

		if ( 'http_request_failed' === $error->get_error_code() && str_contains( $message, 'valid url' ) ) {
			return self::host_not_allowed_error();
		}

		return self::fetch_failed_error();
	}

	private static function filename_from_url( string $url ): string {
		$path = wp_parse_url( $url, PHP_URL_PATH );
		$basename = is_string( $path ) ? wp_basename( $path ) : '';

		if ( '' === $basename || '.' === $basename || '..' === $basename ) {
			return 'mcp-sideload-' . wp_generate_password( 8, false ) . '.img';
		}

		return sanitize_file_name( $basename );
	}

	private static function timeout_error(): \WP_Error {
		return new \WP_Error(
			'fetch_timeout',
			__( 'Downloading the image took too long.', 'elementor' ),
			[ 'status' => \WP_Http::GATEWAY_TIMEOUT ]
		);
	}

	private static function fetch_failed_error(): \WP_Error {
		return new \WP_Error(
			'fetch_failed',
			__( 'Could not download the image from the source URL.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private static function invalid_redirect_error(): \WP_Error {
		return new \WP_Error(
			'invalid_redirect',
			__( 'The source URL returned an invalid redirect.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private static function invalid_url_error(): \WP_Error {
		return new \WP_Error(
			'invalid_url',
			__( 'The source URL is not valid.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}
}
