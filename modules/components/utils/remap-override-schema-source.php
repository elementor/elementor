<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Rewrites `schema_source.id` of an `override` item (directly, or wrapped as the
 * `origin_value` of an `overridable` item) to the destination component id.
 *
 * `Component_Instance_Prop_Type::validate_value()` requires every override's
 * `schema_source.id` to equal the instance `component_id`, so both must move together.
 */
class Remap_Override_Schema_Source {
	public static function apply( array $item, array $component_ids_map ): array {
		switch ( $item['$$type'] ?? null ) {
			case Override_Prop_Type::get_key():
				return self::remap_override( $item, $component_ids_map );

			case Overridable_Prop_Type::get_key():
				if ( is_array( $item['value']['origin_value'] ?? null ) ) {
					$item['value']['origin_value'] = self::remap_override( $item['value']['origin_value'], $component_ids_map );
				}

				return $item;

			default:
				return $item;
		}
	}

	private static function remap_override( array $override, array $component_ids_map ): array {
		if ( Override_Prop_Type::get_key() !== ( $override['$$type'] ?? null ) ) {
			return $override;
		}

		$source_id = $override['value']['schema_source']['id'] ?? null;

		if ( ! is_numeric( $source_id ) || ! isset( $component_ids_map[ (int) $source_id ] ) ) {
			return $override;
		}

		$override['value']['schema_source']['id'] = (int) $component_ids_map[ (int) $source_id ];

		return $override;
	}
}
