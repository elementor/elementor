<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Override_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Props exposed from a nested component keep an `override` origin value whose
 * `schema_source.id` points at the nested component; rewrite it to the imported id.
 */
class Remap_Overridable_Props_Component_Ids {
	public static function apply( array $overridable_props, array $post_ids_map ): array {
		if ( empty( $post_ids_map ) || empty( $overridable_props['props'] ) || ! is_array( $overridable_props['props'] ) ) {
			return $overridable_props;
		}

		foreach ( $overridable_props['props'] as $key => $prop ) {
			$origin_value = $prop['originValue'] ?? null;

			if ( ! is_array( $origin_value ) || Override_Prop_Type::get_key() !== ( $origin_value['$$type'] ?? null ) ) {
				continue;
			}

			$source_id = $origin_value['value']['schema_source']['id'] ?? null;

			if ( ! is_numeric( $source_id ) || ! isset( $post_ids_map[ (int) $source_id ] ) ) {
				continue;
			}

			$overridable_props['props'][ $key ]['originValue']['value']['schema_source']['id'] = (int) $post_ids_map[ (int) $source_id ];
		}

		return $overridable_props;
	}
}
