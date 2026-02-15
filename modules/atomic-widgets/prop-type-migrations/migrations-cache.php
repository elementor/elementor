<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Logger\Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Migrations_Cache {
	private const MIGRATIONS_STATE_META_KEY = '_elementor_migrations_state';

	/**
	 * Is data already migrated?
	 * @param int $id Meta ID, can be post ID or any other unique ID
	 * @param string $data_identifier Unique identifier for Data. Different DB tables migrate separately, and therefore cached individually
	 * @param string $manifest_hash Manifest can change independently from code version (pulled from remote), we need to rerun migrations if it changes
	 * @return bool
	 */
	public static function is_migrated( int $id, string $data_identifier, string $manifest_hash ): bool {
		$cache_meta_key = self::get_cache_meta_key( $data_identifier );
		$current_state = self::get_migration_state( $manifest_hash );

		if ( empty( $current_state ) ) {
			return false;
		}

		$stored_state = get_post_meta( $id, $cache_meta_key, true );

		return $current_state === $stored_state;
	}

	public static function mark_as_migrated( int $id, string $data_identifier, string $manifest_hash ): void {
		$cache_meta_key = self::get_cache_meta_key( $data_identifier );
		update_post_meta( $id, $cache_meta_key, self::get_migration_state( $manifest_hash ) );
	}

	public static function clear_all(): void {
		global $wpdb;

		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key LIKE %s",
				$wpdb->esc_like( self::MIGRATIONS_STATE_META_KEY ) . '%'
			)
		);

		if ( false === $deleted ) {
			Logger::error( 'Failed to clear migration caches', [
				'error' => $wpdb->last_error,
				'reason' => 'clear migration cache called',
			] );

			return;
		}

		Logger::info( 'Cleared migration caches', [
			'deleted_count' => $deleted,
			'reason' => 'clear migration cache called',
		] );
	}

	private static function get_cache_meta_key( string $data_identifier ): string {
		return self::MIGRATIONS_STATE_META_KEY . '_' . substr( md5( $data_identifier ), 0, 4 );
	}

	private static function get_migration_state( string $manifest_hash ): string {
		if ( empty( $manifest_hash ) ) {
			return '';
		}

		return ELEMENTOR_VERSION . ':' . $manifest_hash;
	}
}
