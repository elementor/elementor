<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\Widgets\Component_Instance;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Rewrites `component_id` inside every `e-component` widget in an elements tree
 * so it points at the component post recreated on the destination site instead
 * of the source-site post id that was serialized in the exported template.
 *
 * Used by both website-template (customization) and legacy kit import runners
 * before documents are saved.
 */
class Remap_Component_Instance_Ids {
	public static function apply( array $elements, array $post_ids_map ): array {
		if ( empty( $post_ids_map ) ) {
			return $elements;
		}

		return array_map(
			function ( $element ) use ( $post_ids_map ) {
				return self::remap_element( $element, $post_ids_map );
			},
			$elements
		);
	}

	private static function remap_element( $element, array $post_ids_map ) {
		if ( ! is_array( $element ) ) {
			return $element;
		}

		if ( self::is_component_instance( $element ) ) {
			$element['settings'] = self::remap_component_id( $element['settings'] ?? [], $post_ids_map );
		}

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = self::apply( $element['elements'], $post_ids_map );
		}

		return $element;
	}

	private static function is_component_instance( array $element ): bool {
		return 'widget' === ( $element['elType'] ?? null )
			&& Component_Instance::get_element_type() === ( $element['widgetType'] ?? null );
	}

	private static function remap_component_id( array $settings, array $post_ids_map ): array {
		$source_id = Component_Instance_Prop_Type::extract_component_id( $settings );

		if ( ! is_numeric( $source_id ) || ! isset( $post_ids_map[ (int) $source_id ] ) ) {
			return $settings;
		}

		return Component_Instance_Prop_Type::set_component_id( $settings, (int) $post_ids_map[ (int) $source_id ] );
	}
}
