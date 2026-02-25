<?php

namespace Elementor\Modules\Interactions\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prop_Shape_Filter_For_Pro {

	public static function filter_shape( array $shape ): array {
		if ( Utils::has_pro() ) {
			return $shape;
		}
		return self::filter_shape_recursive( $shape );
	}

	private static function filter_shape_recursive( array $shape ): array {
		$result = [];
		foreach ( $shape as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				$result[ $key ] = $prop_type;
				continue;
			}
			$filtered = self::filter_prop( $prop_type );
			if ( null !== $filtered ) {
				$result[ $key ] = $filtered;
			}
		}
		return $result;
	}

	private static function filter_prop( Prop_Type $prop ): ?Prop_Type {
		if ( $prop->get_meta_item( 'pro', false ) === true ) {
			return null;
		}
		$pro_values = $prop->get_meta_item( 'pro' );
		$enum = $prop->get_meta_item( 'enum' );
		if ( is_array( $pro_values ) && is_array( $enum ) ) {
			return self::create_string_prop_with_base_enum( $prop, array_values( array_diff( $enum, $pro_values ) ) );
		}
		if ( $prop instanceof Object_Prop_Type ) {
			$clone = clone $prop;
			$clone->set_shape( self::filter_shape_recursive( $prop->get_shape() ) );
			return $clone;
		}
		if ( $prop instanceof Array_Prop_Type ) {
			$filtered_item = self::filter_prop( $prop->get_item_type() );
			if ( null !== $filtered_item ) {
				$clone = clone $prop;
				$clone->set_item_type( $filtered_item );
				return $clone;
			}
		}
		return $prop;
	}

	private static function create_string_prop_with_base_enum( Prop_Type $original, array $base_enum ): String_Prop_Type {
		$new_prop = String_Prop_Type::make()->meta( 'enum', $base_enum );
		$desc = $original->get_meta_item( 'description' );
		if ( $desc ) {
			$new_prop->description( $desc );
		}
		$default = $original->get_default();
		if ( null !== $default ) {
			$new_prop->default( $default );
		}
		return $new_prop;
	}
}
