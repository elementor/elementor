<?php

namespace Elementor\Modules\Components\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Removes every `e-component` widget from an elements tree.
 *
 * Used at import time when components round-trip is disabled, to clean up any dangling
 * `e-component` widgets that survived from a zip exported before the flag or by an
 * external site. Dangling instances would point at nonexistent component posts and
 * either render empty or throw in the editor panel.
 */
class Strip_Component_Instances {
	const COMPONENT_INSTANCE_WIDGET_TYPE = 'e-component';

	public static function apply( array $elements ): array {
		$result = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				$result[] = $element;
				continue;
			}

			if ( self::is_component_instance( $element ) ) {
				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::apply( $element['elements'] );
			}

			$result[] = $element;
		}

		return $result;
	}

	private static function is_component_instance( array $element ): bool {
		return 'widget' === ( $element['elType'] ?? null )
			&& self::COMPONENT_INSTANCE_WIDGET_TYPE === ( $element['widgetType'] ?? null );
	}
}
