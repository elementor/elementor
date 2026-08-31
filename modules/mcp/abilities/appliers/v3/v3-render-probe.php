<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Instantiates a widget with a candidate settings array and probe-renders it to detect
 * fatal shapes (e.g. slider control receiving a plain string) before the write is committed.
 *
 * The probe is fail-open: any unexpected condition (missing widget class, V4 atomic widget,
 * probe exceeding the time budget) returns `ok=true` so a legitimate write is never blocked
 * by the safety net itself.
 */
class V3_Render_Probe {

	const TIMEOUT_MS = 250;

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $settings
	 * @return array{ok: bool, error: ?string, error_class: ?string, timed_out: bool}
	 */
	public static function probe( string $widget_type, array $settings ): array {
		$widget = self::clone_widget_instance( $widget_type );

		if ( null === $widget || self::is_atomic_widget( $widget ) ) {
			return self::ok_result();
		}

		if ( ! self::inject_settings( $widget, $settings ) ) {
			return self::ok_result();
		}

		return self::run_render( $widget );
	}

	private static function clone_widget_instance( string $widget_type ): ?object {
		if ( ! isset( Plugin::$instance->widgets_manager ) ) {
			return null;
		}

		$prototype = Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

		if ( ! is_object( $prototype ) || ! method_exists( $prototype, 'render_content' ) ) {
			return null;
		}

		return clone $prototype;
	}

	private static function is_atomic_widget( object $widget ): bool {
		return method_exists( $widget, 'get_props_schema' );
	}

	/**
	 * @param array<string, mixed> $settings
	 */
	private static function inject_settings( object $widget, array $settings ): bool {
		try {
			$reflection = new \ReflectionClass( $widget );
			$data_property = self::find_data_property( $reflection );

			if ( null === $data_property ) {
				return false;
			}

			$data_property->setAccessible( true );
			$current = $data_property->getValue( $widget );
			$current = is_array( $current ) ? $current : [];
			$current['settings'] = $settings;
			$data_property->setValue( $widget, $current );

			return true;
		} catch ( \Throwable $_e ) {
			return false;
		}
	}

	private static function find_data_property( \ReflectionClass $reflection ): ?\ReflectionProperty {
		$class = $reflection;

		while ( $class ) {
			if ( $class->hasProperty( 'data' ) ) {
				return $class->getProperty( 'data' );
			}
			$class = $class->getParentClass() ?: null;
		}

		return null;
	}

	/**
	 * @return array{ok: bool, error: ?string, error_class: ?string, timed_out: bool}
	 */
	private static function run_render( object $widget ): array {
		$started_at = hrtime( true );
		$error_message = null;
		$error_class = null;

		set_error_handler( static function ( $severity, $message, $file, $line ) {
			throw new \ErrorException( $message, 0, $severity, $file, $line );
		}, E_ERROR | E_RECOVERABLE_ERROR | E_USER_ERROR );

		ob_start();

		try {
			$widget->render_content();
		} catch ( \Throwable $e ) {
			$error_message = $e->getMessage();
			$error_class = get_class( $e );
		} finally {
			if ( ob_get_level() > 0 ) {
				ob_end_clean();
			}
			restore_error_handler();
		}

		$elapsed_ms = ( hrtime( true ) - $started_at ) / 1e6;

		if ( $elapsed_ms > self::TIMEOUT_MS ) {
			return [
				'ok' => true,
				'error' => null,
				'error_class' => null,
				'timed_out' => true,
			];
		}

		return [
			'ok' => null === $error_message,
			'error' => $error_message,
			'error_class' => $error_class,
			'timed_out' => false,
		];
	}

	/**
	 * @return array{ok: bool, error: ?string, error_class: ?string, timed_out: bool}
	 */
	private static function ok_result(): array {
		return [
			'ok' => true,
			'error' => null,
			'error_class' => null,
			'timed_out' => false,
		];
	}
}
