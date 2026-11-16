<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Gives an imported component fresh element ids and rewrites the overridable props that reference them:
 * `elementId` points into the component's own tree, while `originPropFields.elementId` points into the
 * tree of a nested component, so it is taken from that component's already rewritten prop.
 */
class Regenerate_Component_Element_Ids {
	/**
	 * @param array $post_data      Component kit file data (`content`, `settings`, `metadata`).
	 * @param array $imported_props source_component_id => rewritten overridable props `props` map.
	 */
	public static function apply( array $post_data, array $imported_props ): array {
		$element_ids = [];

		$post_data['content'] = Plugin::$instance->db->iterate_data( $post_data['content'] ?? [], function ( $element ) use ( &$element_ids ) {
			$new_id = Utils::generate_random_string();

			if ( isset( $element['id'] ) ) {
				$element_ids[ $element['id'] ] = $new_id;
			}

			$element['id'] = $new_id;

			return apply_filters( 'elementor/document/element/replace_id', $element );
		} );

		$props = $post_data['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'] ?? null;

		if ( ! is_array( $props ) ) {
			return $post_data;
		}

		foreach ( $props as $key => $prop ) {
			if ( ! is_array( $prop ) ) {
				continue;
			}

			$prop = self::remap_element_id( $prop, $element_ids );
			$props[ $key ] = self::remap_origin_prop_fields( $prop, $imported_props );
		}

		$post_data['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'] = $props;

		return $post_data;
	}

	private static function remap_element_id( array $prop, array $element_ids ): array {
		$old_id = $prop['elementId'] ?? null;

		if ( is_string( $old_id ) && isset( $element_ids[ $old_id ] ) ) {
			$prop['elementId'] = $element_ids[ $old_id ];
		}

		return $prop;
	}

	/**
	 * The editor copies `originPropFields` up the chain, so the nested component's rewritten prop
	 * already holds the deepest widget id and a single lookup resolves any nesting depth.
	 */
	private static function remap_origin_prop_fields( array $prop, array $imported_props ): array {
		if ( ! is_array( $prop['originPropFields'] ?? null ) ) {
			return $prop;
		}

		$nested_prop = self::find_nested_prop( $prop, $imported_props );

		if ( ! $nested_prop ) {
			return $prop;
		}

		$nested_element_id = $nested_prop['originPropFields']['elementId'] ?? $nested_prop['elementId'] ?? null;

		if ( is_string( $nested_element_id ) ) {
			$prop['originPropFields']['elementId'] = $nested_element_id;
		}

		return $prop;
	}

	private static function find_nested_prop( array $prop, array $imported_props ): ?array {
		$nested_component_id = $prop['originValue']['value']['schema_source']['id'] ?? null;
		$nested_override_key = $prop['originValue']['value']['override_key'] ?? null;

		if ( ! is_numeric( $nested_component_id ) || ! is_string( $nested_override_key ) ) {
			return null;
		}

		$nested_prop = $imported_props[ (int) $nested_component_id ][ $nested_override_key ] ?? null;

		return is_array( $nested_prop ) ? $nested_prop : null;
	}
}
