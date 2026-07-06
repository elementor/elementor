<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dialect_Walker {
	public static function to_schema( Prop_Type $prop_type, string $dialect, ?Prop_Type $parent = null, ?string $shape_key = null ) {
		$children = self::walk_children_schema( $prop_type, $dialect );

		$ctx = new Adapter_Context( $prop_type, $children, $parent, $shape_key, $dialect );

		$adapters = $prop_type->get_dialect_adapters();
		$adapter_class = $adapters[ $dialect ] ?? Base_Dialect_Adapter::class;

		$schema = $adapter_class::to_schema( $ctx );

		if ( ! is_array( $schema ) ) {
			return $schema;
		}

		$default = $prop_type->get_default();
		if ( null !== $default ) {
			$schema['default'] = self::convert_default( $prop_type, $dialect, $default );
		}

		foreach ( $prop_type->get_meta() as $key => $value ) {
			if ( ! in_array( $key, [ 'description', 'llm_instructions', 'examples' ], true ) ) {
				continue;
			}

			if ( empty( $value ) || isset( $schema[ $key ] ) ) {
				continue;
			}

			$schema[ $key ] = 'examples' === $key && ! is_array( $value ) ? [ $value ] : $value;
		}

		return $schema;
	}

	private static function walk_children_schema( Prop_Type $prop_type, string $dialect ): array {
		if ( $prop_type instanceof Object_Prop_Type ) {
			return self::walk_object_children_schema( $prop_type, $dialect );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return self::walk_union_children_schema( $prop_type, $dialect );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return self::walk_array_children_schema( $prop_type, $dialect );
		}

		return [];
	}

	private static function walk_object_children_schema( Object_Prop_Type $prop_type, string $dialect ): array {
		$children = [];

		foreach ( $prop_type->get_shape() as $key => $child_prop_type ) {
			$result = self::to_schema( $child_prop_type, $dialect, $prop_type, $key );

			if ( Dialect_Utils::is_omit( $result ) ) {
				continue;
			}

			$children[ $key ] = $result;
		}

		return $children;
	}

	private static function walk_union_children_schema( Union_Prop_Type $prop_type, string $dialect ): array {
		$children = [];

		foreach ( $prop_type->get_prop_types() as $member ) {
			$result = self::to_schema( $member, $dialect, $prop_type );

			if ( Dialect_Utils::is_omit( $result ) ) {
				continue;
			}

			$children[] = $result;
		}

		return $children;
	}

	private static function convert_default( Prop_Type $prop_type, string $dialect, $canonical ) {
		if ( $prop_type instanceof Union_Prop_Type ) {
			return self::convert_union_default( $prop_type, $dialect, $canonical );
		}

		$adapters      = $prop_type->get_dialect_adapters();
		$adapter_class = $adapters[ $dialect ] ?? Base_Dialect_Adapter::class;
		$ctx           = new Adapter_Context( $prop_type, [], null, null, $dialect );

		$value = $adapter_class::to_dialect_value( $ctx, $canonical );

		if ( $prop_type instanceof Object_Prop_Type && is_array( $value ) ) {
			foreach ( $prop_type->get_shape() as $key => $child_prop_type ) {
				if ( array_key_exists( $key, $value ) && null !== $value[ $key ] ) {
					$value[ $key ] = self::convert_default( $child_prop_type, $dialect, $value[ $key ] );
				}
			}
		}

		if ( $prop_type instanceof Array_Prop_Type && is_array( $value ) ) {
			$item_type = $prop_type->get_item_type();
			$value     = array_map( fn( $item ) => self::convert_default( $item_type, $dialect, $item ), $value );
		}

		return $value;
	}

	private static function convert_union_default( Union_Prop_Type $prop_type, string $dialect, $canonical ) {
		if ( ! is_array( $canonical ) || ! isset( $canonical['$$type'] ) ) {
			return $canonical;
		}

		$member = $prop_type->get_prop_type( $canonical['$$type'] );

		if ( ! $member ) {
			return $canonical;
		}

		return self::convert_default( $member, $dialect, $canonical );
	}

	private static function walk_array_children_schema( Array_Prop_Type $prop_type, string $dialect ): array {
		$item_type = $prop_type->get_item_type();
		$result = self::to_schema( $item_type, $dialect, $prop_type );

		if ( Dialect_Utils::is_omit( $result ) ) {
			return [];
		}

		return [ $result ];
	}
}
