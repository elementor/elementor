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
	public static function apply( array $elements ): array {
		$result = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				$result[] = $element;
				continue;
			}

			if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
				continue;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::apply( $element['elements'] );
			}

			$result[] = $element;
		}

		return $result;
	}
}
