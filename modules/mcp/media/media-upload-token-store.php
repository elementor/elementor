<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Token_Store {

	public static function issue_for_user( int $user_id ): array {
		$token = bin2hex( random_bytes( 32 ) );
		$expires_at = time() + Media_Upload_Config::TOKEN_TTL_SECONDS;

		$data = [
			'user_id' => $user_id,
			'expires_at' => $expires_at,
		];

		set_transient( self::storage_key( $token ), $data, Media_Upload_Config::TOKEN_TTL_SECONDS );

		$index = self::outstanding_index( $user_id );
		$index[ self::token_hash( $token ) ] = $expires_at;
		set_transient( self::user_index_key( $user_id ), $index, Media_Upload_Config::TOKEN_TTL_SECONDS );

		return [
			'token' => $token,
			'expires_at' => $expires_at,
		];
	}

	public static function outstanding_count( int $user_id ): int {
		return count( self::outstanding_index( $user_id ) );
	}

	public static function is_valid_for_request( string $token ): bool {
		$key = self::storage_key( $token );
		$data = get_transient( $key );

		if ( ! is_array( $data ) || empty( $data['user_id'] ) || empty( $data['expires_at'] ) ) {
			return false;
		}

		return time() < (int) $data['expires_at'];
	}

	public static function consume( string $token ) {
		$key = self::storage_key( $token );
		$data = get_transient( $key );

		if ( ! is_array( $data ) || empty( $data['user_id'] ) || empty( $data['expires_at'] ) ) {
			return new \WP_Error(
				'invalid_upload_token',
				__( 'The upload token is invalid or has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( time() >= (int) $data['expires_at'] ) {
			delete_transient( $key );

			return new \WP_Error(
				'upload_token_expired',
				__( 'The upload token has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		// Single use: only the request whose delete_transient() removes the stored token may use it.
		if ( ! delete_transient( $key ) ) {
			return new \WP_Error(
				'invalid_upload_token',
				__( 'The upload token is invalid or has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $data;
	}

	private static function user_index_key( int $user_id ): string {
		return Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . 'user_' . $user_id;
	}

	/**
	 * @return array<string,int> Token hash to expiry time, for tokens that are still unused and unexpired.
	 */
	private static function outstanding_index( int $user_id ): array {
		$index = get_transient( self::user_index_key( $user_id ) );
		$index = is_array( $index ) ? $index : [];
		$now = time();

		foreach ( $index as $hash => $expires_at ) {
			if ( (int) $expires_at <= $now || false === get_transient( Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . $hash ) ) {
				unset( $index[ $hash ] );
			}
		}

		return $index;
	}

	private static function storage_key( string $token ): string {
		return Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . self::token_hash( $token );
	}

	/**
	 * Tokens are stored by an HMAC keyed with the site's auth salt, never in plain text.
	 */
	private static function token_hash( string $token ): string {
		return hash_hmac( 'sha256', $token, wp_salt( 'auth' ) );
	}
}
