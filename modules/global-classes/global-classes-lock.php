<?php

namespace Elementor\Modules\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Per-kit write lock that serializes the read-modify-write of a global-classes save.
 *
 * The lock lives in the options table (INSERT IGNORE on the unique option_name), so it
 * excludes concurrent requests on every site, including sites without a persistent
 * object cache where wp_cache_add() is only per-request. It mirrors WP_Upgrader::create_lock().
 * A lock older than TTL is treated as abandoned (for example after a fatal error) and reclaimed.
 */
class Global_Classes_Lock {
	const TTL = 30;
	const ACQUIRE_ATTEMPTS = 10;
	const ACQUIRE_DELAY_US = 50000;

	/**
	 * Returns the lock token on success, or null if the lock could not be acquired
	 * within the give-up budget. Pass the token to release().
	 */
	public static function acquire( int $kit_id ): ?string {
		global $wpdb;

		$name = self::option_name( $kit_id );

		for ( $attempt = 0; $attempt < self::ACQUIRE_ATTEMPTS; $attempt++ ) {
			$token = time() . '|' . wp_generate_uuid4();

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			if ( $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO `$wpdb->options` ( `option_name`, `option_value`, `autoload` ) VALUES (%s, %s, 'off') /* LOCK */", $name, $token ) ) ) {
				return $token;
			}

			self::clear_if_expired( $name );

			usleep( self::ACQUIRE_DELAY_US );
		}

		return null;
	}

	/**
	 * Only the holder of the exact token can release, so a request whose expired lock
	 * was reclaimed by another request never deletes the new holder's lock.
	 */
	public static function release( int $kit_id, string $token ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete( $wpdb->options, [
			'option_name' => self::option_name( $kit_id ),
			'option_value' => $token,
		] );
	}

	private static function clear_if_expired( string $name ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$held = $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM `$wpdb->options` WHERE option_name = %s", $name ) );

		// The token starts with the acquisition timestamp.
		if ( $held && (int) $held < time() - self::TTL ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->delete( $wpdb->options, [
				'option_name' => $name,
				'option_value' => $held,
			] );
		}
	}

	private static function option_name( int $kit_id ): string {
		return 'elementor_global_classes_lock_' . $kit_id;
	}
}
