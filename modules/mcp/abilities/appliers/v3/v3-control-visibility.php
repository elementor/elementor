<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exposes `Controls_Stack::is_control_visible()` of a registered widget as a callable, so map
 * code decides whether a V3 control takes effect exactly the way Elementor does.
 */
class V3_Control_Visibility {

	/**
	 * @return callable|null `( array $control, array $values, array $controls ): bool`, or null when the widget is not registered.
	 */
	public static function for_widget( string $widget_type ): ?callable {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type );

		if ( ! $widget ) {
			return null;
		}

		return fn( array $control, array $values, array $controls ): bool => (bool) $widget->is_control_visible( $control, $values, $controls );
	}

	/**
	 * Elementor does not store settings left at their default, and `is_control_visible()` treats
	 * a missing condition value as hidden, so unset settings fall back to the control default.
	 *
	 * @param array<string, mixed> $controls
	 * @param array<string, mixed> $settings
	 * @return array<string, mixed>
	 */
	public static function values_with_defaults( array $controls, array $settings ): array {
		$defaults = [];

		foreach ( $controls as $key => $control ) {
			if ( is_array( $control ) ) {
				$defaults[ $key ] = $control['default'] ?? '';
			}
		}

		return array_merge( $defaults, $settings );
	}
}
