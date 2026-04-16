<?php

namespace Elementor\Modules\AppsOauth\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Token_Store {

	const CODE_TRANSIENT_PREFIX  = 'elementor_oauth_code_';
	const CODE_TTL_SECONDS       = 600; // 10 minutes

	const TOKEN_META_KEY         = 'elementor_oauth_tokens';
	const TOKEN_TTL_SECONDS      = 3600; // 1 hour

	/**
	 * Store an authorization code mapped to user credentials.
	 *
	 * @param string $code          Random authorization code.
	 * @param int    $user_id       WP user ID who authorized.
	 * @param string $user_login    WP user login name.
	 * @param string $app_password  Plain-text Application Password (shown once at creation).
	 */
	public function store_code( string $code, int $user_id, string $user_login, string $app_password ): void {
		set_transient(
			self::CODE_TRANSIENT_PREFIX . $code,
			[
				'user_id'      => $user_id,
				'user_login'   => $user_login,
				'app_password' => $app_password,
			],
			self::CODE_TTL_SECONDS
		);
	}

	/**
	 * Consume an authorization code. Returns the stored data and deletes the transient.
	 *
	 * @param string $code Authorization code.
	 * @return array|false Array with user_id, user_login, app_password or false if not found/expired.
	 */
	public function consume_code( string $code ) {
		$data = get_transient( self::CODE_TRANSIENT_PREFIX . $code );

		if ( false === $data ) {
			return false;
		}

		delete_transient( self::CODE_TRANSIENT_PREFIX . $code );

		return $data;
	}

	/**
	 * Store an access token mapped to user credentials.
	 *
	 * @param string $token        Opaque access token (UUID).
	 * @param int    $user_id      WP user ID.
	 * @param string $user_login   WP user login name.
	 * @param string $app_password Plain-text Application Password.
	 */
	public function store_token( string $token, int $user_id, string $user_login, string $app_password ): void {
		$tokens = get_user_meta( $user_id, self::TOKEN_META_KEY, true );

		if ( ! is_array( $tokens ) ) {
			$tokens = [];
		}

		// Purge expired tokens for this user while we have the meta open.
		$now = time();
		$tokens = array_filter( $tokens, static function ( $entry ) use ( $now ) {
			return isset( $entry['expires_at'] ) && $entry['expires_at'] > $now;
		} );

		$tokens[ $token ] = [
			'user_id'      => $user_id,
			'user_login'   => $user_login,
			'app_password' => $app_password,
			'expires_at'   => $now + self::TOKEN_TTL_SECONDS,
		];

		update_user_meta( $user_id, self::TOKEN_META_KEY, $tokens );
	}

	/**
	 * Look up an access token across all users.
	 *
	 * @param string $token Opaque access token.
	 * @return array|false Token data or false if not found/expired.
	 */
	public function find_token( string $token ) {
		global $wpdb;

		// Query user_meta for any user that has this token stored.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$user_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value LIKE %s LIMIT 1",
				self::TOKEN_META_KEY,
				'%' . $wpdb->esc_like( $token ) . '%'
			)
		);

		if ( ! $user_id ) {
			return false;
		}

		$tokens = get_user_meta( (int) $user_id, self::TOKEN_META_KEY, true );

		if ( ! is_array( $tokens ) || ! isset( $tokens[ $token ] ) ) {
			return false;
		}

		$entry = $tokens[ $token ];

		if ( $entry['expires_at'] <= time() ) {
			return false;
		}

		return $entry;
	}
}
