<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Props exposed from a nested component keep `originPropFields.elementId`, which lives in the
 * innermost component's id space, so the wrapping component's own id map can't rewrite it.
 * It is resolved through the nested component that was already imported: its remapped
 * overridable prop (matched by the inner override key) holds the up-to-date innermost id.
 */
class Remap_Overridable_Props_Origin_Element_Ids {
	/**
	 * @param array $overridable_props          Props whose `elementId` already points at `$elements` ids.
	 * @param array $elements                   Component elements; instances still reference source component ids.
	 * @param array $imported_props_by_source   Source component id => imported overridable props.
	 * @param array $imported_id_maps_by_source Source component id => original -> new element ids.
	 */
	public static function apply(
		array $overridable_props,
		array $elements,
		array $imported_props_by_source,
		array $imported_id_maps_by_source
	): array {
		if ( empty( $overridable_props['props'] ) || ! is_array( $overridable_props['props'] ) ) {
			return $overridable_props;
		}

		foreach ( $overridable_props['props'] as $key => $prop ) {
			$origin_element_id = $prop['originPropFields']['elementId'] ?? null;

			if ( ! is_string( $origin_element_id ) ) {
				continue;
			}

			$nested_component_id = self::find_instance_component_id( $elements, $prop['elementId'] ?? '' );

			if ( null === $nested_component_id ) {
				continue;
			}

			$resolved_id = self::resolve_from_nested_props( $prop, $imported_props_by_source[ $nested_component_id ] ?? [] )
				?? $imported_id_maps_by_source[ $nested_component_id ][ $origin_element_id ]
				?? null;

			if ( $resolved_id ) {
				$overridable_props['props'][ $key ]['originPropFields']['elementId'] = $resolved_id;
			}
		}

		return $overridable_props;
	}

	private static function resolve_from_nested_props( array $prop, array $nested_overridable_props ): ?string {
		$origin_value = $prop['originValue'] ?? null;

		if ( ! is_array( $origin_value ) || Override_Prop_Type::get_key() !== ( $origin_value['$$type'] ?? null ) ) {
			return null;
		}

		$inner_key = $origin_value['value']['override_key'] ?? null;
		$nested_prop = $nested_overridable_props['props'][ $inner_key ] ?? null;

		if ( ! is_array( $nested_prop ) ) {
			return null;
		}

		return $nested_prop['originPropFields']['elementId'] ?? $nested_prop['elementId'] ?? null;
	}

	private static function find_instance_component_id( array $elements, string $element_id ): ?int {
		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( ( $element['id'] ?? null ) === $element_id ) {
				if ( ! Component_Instance_Prop_Type::is_instance_element( $element ) ) {
					return null;
				}

				$component_id = Component_Instance_Prop_Type::extract_component_id( $element['settings'] ?? [] );

				return is_numeric( $component_id ) ? (int) $component_id : null;
			}

			$found = self::find_instance_component_id( $element['elements'] ?? [], $element_id );

			if ( null !== $found ) {
				return $found;
			}
		}

		return null;
	}
}
