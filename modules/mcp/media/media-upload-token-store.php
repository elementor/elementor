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

		$index = self::outstanding_index( $user_id );
		$index[ hash( 'sha256', $token ) ] = $expires_at;
		set_transient( self::user_index_key( $user_id ), $index, Media_Upload_Config::TOKEN_TTL_SECONDS );

		return [
			'token' => $token,
			'expires_at' => $expires_at,
		];
	}

	public static function outstanding_count( int $user_id ): int {
		return count( self::outstanding_index( $user_id ) );
	}

	public static function has_capacity_for( int $user_id, int $count ): bool {
		return self::outstanding_count( $user_id ) + $count <= Media_Upload_Config::MAX_OUTSTANDING_TOKENS_PER_USER;
	}

	public static function is_valid_for_request( string $token ): bool {
		if ( ! Mcp_Media_Feature_Gate::is_enabled() ) {
			return false;
		}

		$key = self::storage_key( $token );
		$data = get_transient( $key );

		if ( ! is_array( $data ) || empty( $data['user_id'] ) || empty( $data['expires_at'] ) ) {
			return false;
		}

		return time() < (int) $data['expires_at'];
	}

	public static function consume( string $token ) {
		if ( ! Mcp_Media_Feature_Gate::is_enabled() ) {
			return Mcp_Media_Feature_Gate::disabled_error();
		}

		$key = self::storage_key( $token );
		$lock_key = $key . '_consume';

		// Single-use is enforced when delete_transient() removes the stored token; a false return means another request already consumed it.
		// wp_cache_add only dedupes concurrent consumers within the same HTTP request unless a persistent object cache is configured.
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
		return Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . hash( 'sha256', $token );
	}
}
