<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Collects the ids of components directly referenced by `e-component` widgets
 * anywhere in an elements tree. Used on export to describe how components nest
 * so the importer can recreate them dependencies-first.
 */
class Collect_Component_Dependencies {
	public static function from_elements( array $elements ): array {
		$ids = array_unique( self::collect( $elements ) );

		sort( $ids );

		return $ids;
	}

	private static function collect( array $elements ): array {
		$ids = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
				$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

				if ( is_numeric( $component_id ) ) {
					$ids[] = (int) $component_id;
				}
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$ids = array_merge( $ids, self::collect( $element['elements'] ) );
			}
		}

		return $ids;
	}
}
