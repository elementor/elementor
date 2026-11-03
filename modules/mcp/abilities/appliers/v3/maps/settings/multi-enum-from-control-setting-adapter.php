<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Multiple-choice `select2` control, stored as a list of option keys.
 */
class Multi_Enum_From_Control_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'select2';

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null )
			&& ! empty( $control['multiple'] )
			&& ! empty( $control['options'] )
			&& is_array( $control['options'] );
	}

	public function prop_type( array $control ): Prop_Type {
		$option_values = array_map( 'strval', array_keys( $control['options'] ?? [] ) );

		return String_Array_Prop_Type::make()->set_item_type( String_Prop_Type::make()->enum( $option_values ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$items = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];

		return array_values( array_unique( array_filter( array_map(
			fn( $item ) => is_array( $item ) ? ( $item['value'] ?? null ) : null,
			$items
		), 'is_string' ) ) );
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		return array_values( array_filter( $stored, 'is_string' ) );
	}
}
