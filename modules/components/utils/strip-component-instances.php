<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

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
	public static function apply( array $elements, ?array $kept_component_ids = null ): array {
		$result = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				$result[] = $element;
				continue;
			}

			if ( self::should_strip_element( $element, $kept_component_ids ) ) {
				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::apply( $element['elements'], $kept_component_ids );
			}

			$result[] = $element;
		}

		return $result;
	}

	private static function should_strip_element( array $element, ?array $kept_component_ids ): bool {
		if ( ! Component_Instance_Prop_Type::is_instance_element( $element ) ) {
			return false;
		}

		if ( null === $kept_component_ids ) {
			return true;
		}

		$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

		return ! is_numeric( $component_id ) || ! in_array( (int) $component_id, $kept_component_ids, true );
	}
}
