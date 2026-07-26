<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Interactions\Props\Interaction_Item_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the LLM-facing schema for interactions from the native Interaction_Item_Prop_Type tree.
 *
 * Same pattern as widget schemas: derive the plain JSON shape from the PropType via
 * `Widget_Context_Helper::to_plain_llm_schema`, then strip Pro-gated fields and enum
 * values (via `->meta('pro', ...)`) when Pro is inactive.
 */
class Interactions_Llm_Schema_Builder {

	public static function build( ?bool $is_pro_active = null ): array {
		$is_pro_active = $is_pro_active ?? defined( 'ELEMENTOR_PRO_VERSION' );

		$prop_type = Interaction_Item_Prop_Type::make();
		$schema = Widget_Context_Helper::to_plain_llm_schema( $prop_type );

		return self::walk( $schema, $prop_type, $is_pro_active );
	}

	private static function walk( array $schema, Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( $prop_type instanceof Object_Prop_Type ) {
			return self::walk_object( $schema, $prop_type, $is_pro_active );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return self::walk_array( $schema, $prop_type, $is_pro_active );
		}

		return self::enrich_primitive( $schema, $prop_type, $is_pro_active );
	}

	private static function walk_object( array $schema, Object_Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( ! isset( $schema['properties'] ) || ! is_array( $schema['properties'] ) ) {
			return $schema;
		}

		$properties = $schema['properties'];

		foreach ( $prop_type->get_shape() as $key => $child_prop_type ) {
			if ( ! isset( $properties[ $key ] ) ) {
				continue;
			}

			if ( ! $is_pro_active && self::is_pro_only_field( $child_prop_type ) ) {
				unset( $properties[ $key ] );
				continue;
			}

			$properties[ $key ] = self::walk( $properties[ $key ], $child_prop_type, $is_pro_active );
		}

		$schema['properties'] = $properties;

		return $schema;
	}

	private static function walk_array( array $schema, Array_Prop_Type $prop_type, bool $is_pro_active ): array {
		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = self::walk( $schema['items'], $prop_type->get_item_type(), $is_pro_active );
		}

		return $schema;
	}

	private static function enrich_primitive( array $schema, Prop_Type $prop_type, bool $is_pro_active ): array {
		$enum = $prop_type->get_meta_item( 'enum' );

		if ( is_array( $enum ) ) {
			$schema['enum'] = $is_pro_active ? array_values( $enum ) : self::filter_pro_enum_values( $enum, $prop_type );
		}

		return $schema;
	}

	private static function filter_pro_enum_values( array $enum, Prop_Type $prop_type ): array {
		$pro_values = $prop_type->get_meta_item( 'pro' );

		if ( ! is_array( $pro_values ) ) {
			return array_values( $enum );
		}

		return array_values( array_diff( $enum, $pro_values ) );
	}

	private static function is_pro_only_field( Prop_Type $prop_type ): bool {
		return true === $prop_type->get_meta_item( 'pro' );
	}
}
