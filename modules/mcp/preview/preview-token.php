<?php

namespace Elementor\Modules\Mcp\Preview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Preview_Token {

	const QUERY_ARG = 'elementor_preview_token';
	const SECRET_NAMESPACE = 'elementor_preview_link_v1';

	public static function encode( int $post_id, int $revision_id, int $expires_at, string $secret ): string {
		$payload = self::base64url_encode( wp_json_encode( [
			'p' => $post_id,
			'r' => $revision_id,
			'e' => $expires_at,
		] ) );

		$signature = self::sign( $payload, $secret );

		return $payload . '.' . $signature;
	}

	public static function decode( string $token, string $secret ): ?array {
		$parts = explode( '.', $token );

		if ( count( $parts ) !== 2 ) {
			return null;
		}

		[ $payload, $signature ] = $parts;

		if ( ! hash_equals( self::sign( $payload, $secret ), $signature ) ) {
			return null;
		}

		$decoded = json_decode( self::base64url_decode( $payload ), true );

		if ( ! is_array( $decoded ) || ! isset( $decoded['p'], $decoded['r'], $decoded['e'] ) ) {
			return null;
		}

		return [
			'post_id' => (int) $decoded['p'],
			'revision_id' => (int) $decoded['r'],
			'expires_at' => (int) $decoded['e'],
		];
	}

	public static function is_expired( array $claims, int $now ): bool {
		return $now >= $claims['expires_at'];
	}

	public static function secret(): string {
		return wp_salt( 'auth' ) . self::SECRET_NAMESPACE;
	}

	private static function sign( string $payload, string $secret ): string {
		return self::base64url_encode( hash_hmac( 'sha256', $payload, $secret, true ) );
	}

	private static function base64url_encode( string $data ): string {
		return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
	}

	private static function base64url_decode( string $data ): string {
		$pad = strlen( $data ) % 4;

		if ( $pad > 0 ) {
			$data .= str_repeat( '=', 4 - $pad );
		}

		return base64_decode( strtr( $data, '-_', '+/' ) );
	}
}
