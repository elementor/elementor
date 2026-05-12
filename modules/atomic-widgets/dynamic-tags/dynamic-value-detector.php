<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Value_Detector {
	public static function contains_dynamic_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( Dynamic_Prop_Type::is_dynamic_prop_value( $value ) ) {
			return true;
		}

		foreach ( $value as $item ) {
			if ( self::contains_dynamic_value( $item ) ) {
				return true;
			}
		}

		return false;
	}
}
