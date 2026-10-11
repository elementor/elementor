<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Public_Host_Validator {

	public static function assert_https_url( string $url ): ?\WP_Error {
		$parts = wp_parse_url( $url );

		if ( ! is_array( $parts ) || empty( $parts['scheme'] ) || empty( $parts['host'] ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( 'https' !== strtolower( $parts['scheme'] ) ) {
			return new \WP_Error(
				'invalid_url_scheme',
				__( 'Only HTTPS source URLs are allowed.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( isset( $parts['user'] ) || isset( $parts['pass'] ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	public static function assert_host_resolves_publicly( string $host ): ?\WP_Error {
		$host = strtolower( trim( $host, '[]' ) );

		if ( '' === $host ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return self::assert_public_ip( $host );
		}

		$records = self::resolve_dns( $host );

		if ( null === $records ) {
			return new \WP_Error(
				'host_resolution_failed',
				__( 'The source host could not be resolved.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( [] === $records ) {
			return new \WP_Error(
				'host_resolution_failed',
				__( 'The source host could not be resolved.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		foreach ( $records as $ip ) {
			$ip_error = self::assert_public_ip( $ip );
			if ( $ip_error ) {
				return $ip_error;
			}
		}

		return null;
	}

	public static function assert_public_ip( string $ip ): ?\WP_Error {
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
			return new \WP_Error(
				'private_host_blocked',
				__( 'The source URL points to a private or reserved network address.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	/**
	 * @return string[]|null List of IP strings, empty when none, null when resolution is unavailable.
	 */
	public static function resolve_dns( string $host ): ?array {
		$ips = [];

		if ( function_exists( 'dns_get_record' ) ) {
			$ipv4 = @dns_get_record( $host, DNS_A );
			if ( is_array( $ipv4 ) ) {
				foreach ( $ipv4 as $record ) {
					if ( ! empty( $record['ip'] ) ) {
						$ips[] = $record['ip'];
					}
				}
			}

			$ipv6 = @dns_get_record( $host, DNS_AAAA );
			if ( is_array( $ipv6 ) ) {
				foreach ( $ipv6 as $record ) {
					if ( ! empty( $record['ipv6'] ) ) {
						$ips[] = $record['ipv6'];
					}
				}
			}
		}

		if ( [] === $ips ) {
			$fallback = gethostbynamel( $host );
			if ( is_array( $fallback ) ) {
				$ips = $fallback;
			}
		}

		return array_values( array_unique( array_filter( $ips, 'is_string' ) ) );
	}
}
