<?php

namespace Elementor\Modules\AtomicWidgets\Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Simple logger for Atomic Widgets that writes to wp-content/debug.log (if WP_DEBUG_LOG enabled
 * and WP_DEBUG_DISPLAY disabled) or optionally to Elementor's DB logger.
 * Never displays errors on screen.
 */
class Logger {

	public static function info( string $message, array $context = [], bool $use_elementor_logger = false ): void {
		self::log_message( $message, $context, $use_elementor_logger, 'info' );
	}

	public static function warning( string $message, array $context = [], bool $use_elementor_logger = false ): void {
		self::log_message( $message, $context, $use_elementor_logger, 'warning' );
	}

	public static function error( string $message, array $context = [], bool $use_elementor_logger = false ): void {
		self::log_message( $message, $context, $use_elementor_logger, 'error' );
	}

	private static function log_message( string $message, array $context, bool $use_elementor_logger, string $level ): void {
		if ( $use_elementor_logger ) {
			self::log_to_elementor_db( $message, $context, $level );
			return;
		}

		self::log_to_wp_debug_file( $message, $context, $level );
	}

	private static function log_to_wp_debug_file( string $message, array $context, string $level ): void {
		if ( ! self::should_log_to_file() ) {
			return;
		}

		$formatted_message = self::format_message( $message, $context, $level );
		error_log( $formatted_message );
	}

	private static function log_to_elementor_db( string $message, array $context, string $level ): void {
		if ( ! isset( \Elementor\Plugin::$instance->logger ) ) {
			return;
		}

		try {
			$logger = \Elementor\Plugin::$instance->logger;

			switch ( $level ) {
				case 'error':
					$logger->error( $message, $context );
					break;
				case 'warning':
					$logger->warning( $message, $context );
					break;
				default:
					$logger->info( $message, $context );
					break;
			}
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch -- Logger must not throw exceptions
		}
	}

	private static function should_log_to_file(): bool {
		$debug_log_enabled = defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG;
		$debug_display_disabled = ! defined( 'WP_DEBUG_DISPLAY' ) || ! WP_DEBUG_DISPLAY;

		return $debug_log_enabled && $debug_display_disabled;
	}

	private static function format_message( string $message, array $context, string $level ): string {
		$level_prefix = strtoupper( $level );
		$formatted = "[Elementor Atomic Widgets] [{$level_prefix}] " . $message;

		if ( ! empty( $context ) ) {
			$context_json = wp_json_encode( $context, JSON_UNESCAPED_SLASHES );

			if ( false !== $context_json ) {
				$formatted .= ' | Context: ' . $context_json;
			}
		}

		return $formatted;
	}
}
