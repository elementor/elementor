<?php

namespace Elementor\Modules\Components\ImportExportCustomization;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Reference_Collector {
	public static function from_elements( array $elements ): array {
		$component_ids = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
				$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

				if ( is_numeric( $component_id ) ) {
					$component_ids[] = (int) $component_id;
				}
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$component_ids = array_merge( $component_ids, self::from_elements( $element['elements'] ) );
			}
		}

		return array_values( array_unique( $component_ids ) );
	}
}
