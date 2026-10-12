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
	public static function get( string $url, string $host, string $pinned_ip ) {
		if ( ! self::is_curl_transport_available() ) {
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

		$hook = static function ( $handle ) use ( $resolve_entry ) {
			if ( ! is_resource( $handle ) && ! ( is_object( $handle ) && $handle instanceof \CurlHandle ) ) {
				return;
			}

			curl_setopt( $handle, self::curl_resolve_option(), [ $resolve_entry ] );
		};

		add_action( 'http_api_curl', $hook, 10, 1 );

		$response = wp_remote_get(
			$url,
			[
				'timeout' => Media_Upload_Config::FETCH_TIMEOUT_SECONDS,
				'redirection' => 0,
				'reject_unsafe_urls' => false,
				'limit_response_size' => Media_Upload_Config::max_upload_bytes() + 1,
			]
		);

		remove_action( 'http_api_curl', $hook, 10 );

		return $response;
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
}
