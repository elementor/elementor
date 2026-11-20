<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Removes `e-component` widgets from an elements tree.
 *
 * Used at import time to clean up dangling `e-component` widgets: when components round-trip
 * is disabled every instance is removed, and otherwise only instances whose component was not
 * imported. Dangling instances would point at nonexistent (or unrelated) posts and either
 * render empty or throw in the editor panel.
 */
class Strip_Component_Instances {
	/**
	 * @param array      $elements
	 * @param int[]|null $kept_component_ids `null` strips every instance; a list strips only instances pointing elsewhere.
	 */
	public static function apply( array $elements, ?array $kept_component_ids = null ): array {
		$result = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				$result[] = $element;
				continue;
			}

			if ( Component_Instance_Prop_Type::is_instance_element( $element ) && ! self::is_kept( $element, $kept_component_ids ) ) {
				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::apply( $element['elements'], $kept_component_ids );
			}

			$result[] = $element;
		}

		return $result;
	}

	private static function is_kept( array $element, ?array $kept_component_ids ): bool {
		if ( null === $kept_component_ids ) {
			return false;
		}

		$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

		return is_numeric( $component_id ) && in_array( (int) $component_id, $kept_component_ids, true );
	}
}
