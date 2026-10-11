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

		return [
			'token' => $token,
			'expires_at' => $expires_at,
		];
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

		delete_transient( $key );

		return $data;
	}

	public static function peek( string $token ) {
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

		return $data;
	}

	private static function storage_key( string $token ): string {
		return Media_Upload_Config::TOKEN_TRANSIENT_PREFIX . hash( 'sha256', $token );
	}
}
