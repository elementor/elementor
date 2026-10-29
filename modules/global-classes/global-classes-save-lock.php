<?php
namespace Elementor\Modules\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Save_Lock {
	const LOCK_NAME = 'elementor_global_classes_save';
	const RELEASE_TIMEOUT_SECONDS = 60;
	const MAX_WAIT_SECONDS = 10;
	const RETRY_INTERVAL_MICROSECONDS = 250000;

	private int $max_wait_seconds;

	public function __construct( int $max_wait_seconds = self::MAX_WAIT_SECONDS ) {
		$this->max_wait_seconds = $max_wait_seconds;
	}

	public static function make(): self {
		return new self();
	}

	public function run( callable $callback, callable $on_busy ) {
		if ( ! $this->acquire() ) {
			return $on_busy();
		}

		// The kit meta is cached at boot, before the lock; a stale copy would drop classes saved meanwhile.
		$this->flush_runtime_cache();

		try {
			return $callback();
		} finally {
			\WP_Upgrader::release_lock( self::LOCK_NAME );
		}
	}

	private function acquire(): bool {
		if ( ! class_exists( '\WP_Upgrader' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		$deadline = microtime( true ) + $this->max_wait_seconds;

		while ( ! \WP_Upgrader::create_lock( self::LOCK_NAME, self::RELEASE_TIMEOUT_SECONDS ) ) {
			if ( microtime( true ) >= $deadline ) {
				return false;
			}

			usleep( self::RETRY_INTERVAL_MICROSECONDS );
		}

		return true;
	}

	private function flush_runtime_cache(): void {
		if ( function_exists( 'wp_cache_flush_runtime' ) ) {
			wp_cache_flush_runtime();
		}
	}
}
