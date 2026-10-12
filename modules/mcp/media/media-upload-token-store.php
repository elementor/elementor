<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Token_Store {

	private const CONSUME_LOCK_GROUP = 'elementor_mcp_upload_consume';

	public static function issue_for_user( int $user_id ): array {
		$token = bin2hex( random_bytes( 32 ) );
		$expires_at = time() + Media_Upload_Config::TOKEN_TTL_SECONDS;

		$data = [
			'user_id' => $user_id,
			'expires_at' => $expires_at,
		];

		set_transient( self::storage_key( $token ), $data, Media_Upload_Config::TOKEN_TTL_SECONDS );

		return [
			'token' => $token,
			'expires_at' => $expires_at,
		];
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
		$lock_key = $key . '_consume';

		if ( ! wp_cache_add( $lock_key, 1, self::CONSUME_LOCK_GROUP, 30 ) ) {
			return new \WP_Error(
				'invalid_upload_token',
				__( 'The upload token is invalid or has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$data = get_transient( $key );

		if ( ! is_array( $data ) || empty( $data['user_id'] ) || empty( $data['expires_at'] ) ) {
			wp_cache_delete( $lock_key, self::CONSUME_LOCK_GROUP );

			return new \WP_Error(
				'invalid_upload_token',
				__( 'The upload token is invalid or has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( time() >= (int) $data['expires_at'] ) {
			delete_transient( $key );
			wp_cache_delete( $lock_key, self::CONSUME_LOCK_GROUP );

			return new \WP_Error(
				'upload_token_expired',
				__( 'The upload token has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( ! delete_transient( $key ) ) {
			wp_cache_delete( $lock_key, self::CONSUME_LOCK_GROUP );

			return new \WP_Error(
				'invalid_upload_token',
				__( 'The upload token is invalid or has expired.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		wp_cache_delete( $lock_key, self::CONSUME_LOCK_GROUP );

		return $data;
	}

	private static function storage_key( string $token ): string {
		return Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . hash( 'sha256', $token );
	}
}
