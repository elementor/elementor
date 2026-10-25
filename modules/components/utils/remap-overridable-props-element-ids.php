<?php

namespace Elementor\Modules\Components\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Remap_Overridable_Props_Element_Ids {
	public static function apply( array $overridable_props, array $id_map ): array {
		if ( empty( $id_map ) || empty( $overridable_props['props'] ) ) {
			return $overridable_props;
		}

		foreach ( $overridable_props['props'] as $key => $prop ) {
			if ( isset( $prop['elementId'] ) && isset( $id_map[ $prop['elementId'] ] ) ) {
				$overridable_props['props'][ $key ]['elementId'] = $id_map[ $prop['elementId'] ];
			}

			if ( isset( $prop['originPropFields']['elementId'] ) && isset( $id_map[ $prop['originPropFields']['elementId'] ] ) ) {
				$overridable_props['props'][ $key ]['originPropFields']['elementId'] = $id_map[ $prop['originPropFields']['elementId'] ];
			}
		}

		return $overridable_props;
	}
}
