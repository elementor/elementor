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

		if ( isset( $parts['port'] ) && 443 !== (int) $parts['port'] ) {
			return new \WP_Error(
				'invalid_url_port',
				__( 'Only the default HTTPS port is allowed.', 'elementor' ),
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

		if ( ! self::is_strict_dns_name( $host ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
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

	/**
	 * Accepts only plain DNS names. Numeric-looking hosts (decimal, octal, hex or short forms) are
	 * rejected because the HTTP client may read them as addresses instead of resolving them.
	 */
	public static function is_strict_dns_name( string $host ): bool {
		$host = strtolower( $host );

		if ( '' === $host || strlen( $host ) > 254 ) {
			return false;
		}

		if ( str_ends_with( $host, '.' ) ) {
			$host = substr( $host, 0, -1 );
		}

		if ( ! preg_match( '/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/', $host ) ) {
			return false;
		}

		$labels = explode( '.', $host );
		$last_label = end( $labels );

		if ( preg_match( '/^[0-9]+$/', $last_label ) || str_starts_with( $last_label, '0x' ) ) {
			return false;
		}

		return true;
	}

	public static function assert_url_accepted_by_wp( string $url ): ?\WP_Error {
		if ( ! wp_http_validate_url( $url ) ) {
			return new \WP_Error(
				'invalid_url',
				__( 'The source URL is not valid.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
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

		if ( self::is_denied_ip( $ip ) ) {
			return new \WP_Error(
				'private_host_blocked',
				__( 'The source URL points to a private or reserved network address.', 'elementor' ),
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

	public static function is_denied_ip( string $ip ): bool {
		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			return self::is_denied_ipv4( $ip );
		}

		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 ) ) {
			return self::is_denied_ipv6( $ip );
		}

		return true;
	}

	private static function is_denied_ipv4( string $ip ): bool {
		$long = ip2long( $ip );
		if ( false === $long ) {
			return true;
		}

		$long = sprintf( '%u', $long );

		if ( self::ipv4_in_range( $long, '0.0.0.0', 8 ) ) {
			return true;
		}

		if ( self::ipv4_in_range( $long, '100.64.0.0', 10 ) ) {
			return true;
		}

		if ( self::ipv4_in_range( $long, '169.254.0.0', 16 ) ) {
			return true;
		}

		return false;
	}

	private static function is_denied_ipv6( string $ip ): bool {
		$packed = inet_pton( $ip );
		if ( false === $packed || strlen( $packed ) !== 16 ) {
			return true;
		}

		$first = ord( $packed[0] );
		$second = ord( $packed[1] );

		if ( 0xfe === $first && ( $second & 0xc0 ) === 0x80 ) {
			return true;
		}

		if ( 0xfc === $first || 0xfd === $first ) {
			return true;
		}

		if ( 0x00 === $first && 0x64 === $second && 0xff === ord( $packed[2] ) && 0x9b === ord( $packed[3] ) ) {
			return true;
		}

		if ( 0x20 === $first && 0x02 === $second ) {
			return true;
		}

		if ( 0x20 === $first && 0x01 === $second && 0x00 === ord( $packed[2] ) && 0x00 === ord( $packed[3] ) ) {
			return true;
		}

		if ( self::ipv6_is_ipv4_mapped( $packed ) ) {
			$embedded = long2ip( unpack( 'N', substr( $packed, 12, 4 ) )[1] );
			if ( is_string( $embedded ) && null !== self::assert_public_ip( $embedded ) ) {
				return true;
			}
		}

		return false;
	}

	private static function ipv6_is_ipv4_mapped( string $packed ): bool {
		if ( strlen( $packed ) !== 16 ) {
			return false;
		}

		return "\0\0\0\0\0\0\0\0\0\0\xff\xff" === substr( $packed, 0, 12 );
	}

	private static function ipv4_in_range( string $unsigned_long, string $network, int $prefix_length ): bool {
		$network_long = ip2long( $network );
		if ( false === $network_long ) {
			return false;
		}

		$network_long = sprintf( '%u', $network_long );
		$mask = 0 === $prefix_length ? 0 : ( 0xffffffff << ( 32 - $prefix_length ) ) & 0xffffffff;

		return ( (int) $unsigned_long & $mask ) === ( (int) $network_long & $mask );
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

		$hosts_file = gethostbynamel( $host );
		if ( is_array( $hosts_file ) ) {
			$ips = array_merge( $ips, $hosts_file );
		}

		$ips = array_values( array_unique( array_filter( $ips, 'is_string' ) ) );

		if ( defined( 'WP_TESTS_DOMAIN' ) && WP_TESTS_DOMAIN ) {
			/**
			 * @param string[] $ips
			 */
			$ips = apply_filters( 'elementor/mcp/media/test_resolved_host_ips', $ips, $host );
		}

		return $ips;
	}
}
